"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
  messages,
  roomId,
}: {
  messages: { message: string }[];
  roomId: string;
}) {
  const { socket, loading } = useSocket();
  const [chats, setChats] = useState(messages);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
        }),
      );
    const handleMessage = (event: MessageEvent) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === "chat") {
        setChats((c) => [...c, { message: parsedData.message }]);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage); // ✅ cleanup
    };
    }
  }, [socket, loading, roomId]);

  return (
    <div className="">
      {chats.map((m) => (
        <div id={m._id}>{m.message}</div>
      ))}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => {
          setCurrentMessage(e.target.value);
        }}
      />
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId,
              message: currentMessage,
            }),
          );
          setCurrentMessage("");
        }}
      >
        Send Message
      </button>
    </div>
  );
}
