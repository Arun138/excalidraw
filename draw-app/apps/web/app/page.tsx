"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "./config";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const [allRooms, setAllRooms] = useState([]);

  async function fetchRooms() {
    const response = await axios.get(`${BACKEND_URL}/allRooms`);
    console.log(response);
    
    setAllRooms(response?.data);
  }
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="">
      <div className="">
        {allRooms.map((room)=> 
        <div key={room._id}>
          <p >Slug : {room?.slug} </p>
          <button onClick={() => {router.push(`/room/${String(room._id)}`)}}>Join room</button>
        </div>
        )}
      </div>
    </div>
  );
}
