import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {Chat} from '@repo/db/db'

let wss = new WebSocketServer({ port: 8080 });

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.id) {
      return null;
    }
    return decoded.id;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (userId === null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    // parse incoming data
    const parsedData = JSON.parse(data as unknown as string); // data = '{type:"join-room",roomId:1}'

    const user = users.find((x) => x.ws === ws);
    if (!user) {
      return;
    }

    // parsedData = {type:"join-room",roomId:1}
    if (parsedData.type === "join-room") {
      user.rooms.push(parsedData.roomId);
    }
    
    // parsedData = {type:"leave-room",roomId:1}
    if (parsedData.type === "leave-room") {
      user.rooms = user?.rooms.filter((x) => x !== parsedData.roomId);
    }

    // parsedData = {type:"chat",message:"xyz",roomId:1}
    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await Chat.create({message,room:roomId,user:userId}) // storing in db is a slow process, especially when we need to show the chats after db update. we are supposed to use Queue and push it through an async pipeline 

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            }),
          );
        }
      });
    }
  });
});
