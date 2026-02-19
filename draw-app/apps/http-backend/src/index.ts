import express from "express";

import { JWT_SECRET, bcrypt } from "@repo/backend-common/config";

import { signInSchema, signUpSchema, createRoomSchema } from "@repo/common/zod";

import { Chat, mongoose, Room, User } from "@repo/db/db"; // mongodb model

// import { prisma } from "@repo/db-prisma/prisma"; // prisma didn't work

import jwt from "jsonwebtoken";
import cors from 'cors'
import { authMiddleware } from "./middleware.js";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedContent = signUpSchema.safeParse(req.body);

  if (!parsedContent.success) {
    return res
      .status(411)
      .json({ message: "Invalid data", error: parsedContent.error });
  }

  try {
    const username = parsedContent.data.username;
    const password = parsedContent.data.password;
    const name = parsedContent.data.name;

    const userExist = await User.findOne({ username });
    // const userExist = await prisma.user.findFirst({
    //   where: { username: { equals: username } },
    // });
    if (userExist) {
      return res.status(403).json({ message: "User already exists !" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(403).json({ message: "Error during hashing!" });
      }
      if (hash) {
        await User.create({ username, password: hash, name });
        // await prisma.user.create({ data: { username, password: hash, name } });
        return res.status(200).json({ message: "User created" });
      } else {
        return res.status(403).json({ message: "User couldn't be created" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error| " + error });
  }
});

app.post("/signin", async (req, res) => {
  const parsedContent = signInSchema.safeParse(req.body);

  if (!parsedContent.success) {
    return res
      .status(411)
      .json({ message: "Invalid data", error: parsedContent.error });
  }

  try {
    const username = parsedContent.data.username;
    const password = parsedContent.data.password;
    const userExist = await User.findOne({ username });
    // const userExist = await prisma.user.findFirst({
    //   where: { username: { equals: username } },
    // });

    if (!userExist) {
      return res.status(403).json({ message: "User does not exist !" });
    }

    bcrypt.compare(password, userExist.password, async (err, result) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Error during password analysing" });
      }
      if (result) {
        const token = jwt.sign({ id: userExist._id }, JWT_SECRET);
        return res.status(200).json({ token });
      } else {
        return res
          .status(403)
          .json({ message: "Username - Password doesn't match !" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error | " + error });
  }
});

app.get("/room", authMiddleware, async (req, res) => {
  // to create room
  // req.body will contain only slug name
  const parsedContent = createRoomSchema.safeParse(req.body);
  if (!parsedContent.success) {
    return res
      .status(411)
      .json({ message: "Invalid inputs", error: parsedContent.error });
  }
  try {
    const userId = req.userId;

    const room = await Room.create({
      slug: parsedContent.data.name,
      admin: userId,
    });

    return res.status(200).json({ message: "Room created.", room });
  } catch (error) {
    return res.status(500).json({ message: "Server error | " + error });
  }
});

app.get('/allRooms', async (req,res) => {
  const allRooms = await Room.find()
  return res.status(200).json(allRooms)
})

app.get("/room/:slug", async (req, res) => {
  // to just fetch the room id from the given slug. Only useful for frontend
  const slug = String(req.params.slug);
  const room = await Room.findOne({ slug });
  return room?._id;
});

app.get("/chats/:roomId", async (req, res) => {
  // to fetch messages of a room
  const room = String(req.params.roomId);
  const messages = await Chat.find({ room: new mongoose.Types.ObjectId(room) })
    .sort({ _id: -1 })
    .limit(50); // "new mongoose.Types.ObjectId" converts "room" from string to an ObjectId.
  res.json({ messages });
});

app.listen(3001);
