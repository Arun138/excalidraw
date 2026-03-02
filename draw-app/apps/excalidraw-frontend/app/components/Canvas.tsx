import { useEffect, useRef, useState } from "react";
import InitDraw from "../draw"; // not using InitDraw anymore
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);
      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  if (!socket) {
    return <div>Connecting to server ...</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      className="flex"
      style={{
        position: "fixed",
        top: 10,
        left: 10,
      }}
    >
      <IconButton
        icon={<Pencil />}
        onClick={() => {
          setSelectedTool("pencil");
        }}
        activated={selectedTool === "pencil"} // gives boolean value
      />
      <IconButton
        icon={<RectangleHorizontalIcon />}
        onClick={() => {
          setSelectedTool("rect");
        }}
        activated={selectedTool === "rect"}
      />
      <IconButton
        icon={<Circle />}
        onClick={() => {
          setSelectedTool("circle");
        }}
        activated={selectedTool === "circle"}
      />
    </div>
  );
}
