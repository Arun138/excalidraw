"use client";
import { useEffect, useState } from "react";
import { WS_URL } from "../config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGRiYzM3NDcxODg2Y2ZiYmJiODkzMyIsImlhdCI6MTc3MTEzODg4OX0.ie2lHn8nVOFRVt_BFXHpj5MSt-6rGKjw1vYamofi1W4`,
    );
    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({ type: "join-room", roomId });
      ws.send(data);
    };
  }, []);

  if (!socket) {
    return <div>Connecting to server ...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
