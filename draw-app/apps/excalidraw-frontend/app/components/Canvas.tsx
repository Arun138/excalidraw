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
  const choosenShape = useRef<string>('rect');

  useEffect(() => {
    if (canvasRef.current && choosenShape) {
      InitDraw(canvasRef.current, roomId, socket,choosenShape);
    }
  }, [canvasRef,choosenShape]);

  if (!socket) {
    return <div>Connecting to server ...</div>;
  }

  return (
    <div>
      <canvas ref={canvasRef} width={1550} height={750}></canvas>
      <div className="">
        <button onClick={()=>{choosenShape.current = 'rect';
        }}>Rectangle</button>
        <button onClick={()=>{choosenShape.current = 'circle';
        }}>Circle</button>
        <button onClick={()=>choosenShape.current = 'ellipse'}>Ellipse</button>
      </div>
    </div>
  );
}
