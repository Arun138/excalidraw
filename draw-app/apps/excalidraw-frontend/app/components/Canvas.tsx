import { useEffect, useRef } from "react";
import InitDraw from "../draw";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      InitDraw(canvasRef.current, roomId, socket);
    }
  }, [canvasRef]);

  if (!socket) {
    return <div>Connecting to server ...</div>;
  }

  return (
    <div>
      <canvas ref={canvasRef} width={1550} height={750}></canvas>
    </div>
  );
}
