import { useEffect, useRef } from "react";
import InitDraw from "../draw";
import { Button } from "@repo/ui/button";

import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RiRectangleLine } from "react-icons/ri";
import { TbOvalVertical } from "react-icons/tb";
import { LuSlash } from "react-icons/lu";
import { GoPencil } from "react-icons/go";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const choosenShape = useRef<string>("rect");

  useEffect(() => {
    if (canvasRef.current && choosenShape) {
      InitDraw(canvasRef.current, roomId, socket, choosenShape);
    }
  }, [canvasRef, choosenShape]);

  if (!socket) {
    return <div>Connecting to server ...</div>;
  }

  return (
    <div className="">
      <canvas ref={canvasRef} width={1550} height={750}></canvas>
      <div className=" fixed  top-3 flex justify-center w-full ">
        <div className="p-2 flex gap-2 justify-center   bg-blue-950 text-white  w-min ">
          <Button
            className="cursor-pointer"
            size="lg"
            variant="primary"
            onClick={() => {
              choosenShape.current = "rect";
            }}
            children={<RiRectangleLine />}
          />
          <Button
            className="cursor-pointer"
            size="lg"
            variant="primary"
            onClick={() => {
              choosenShape.current = "circle";
            }}
            children={<RiCheckboxBlankCircleLine />}
          />
          <Button
            className="cursor-pointer"
            size="lg"
            variant="primary"
            onClick={() => {
              choosenShape.current = "ellipse";
            }}
            children={<TbOvalVertical />}
          />
          <Button
            className="cursor-pointer"
            size="lg"
            variant="primary"
            onClick={() => {
              choosenShape.current = "line";
            }}
            children={<LuSlash />}
          />
          <Button
            className="cursor-pointer"
            size="lg"
            variant="primary"
            onClick={() => {
              choosenShape.current = "pencil";
            }}
            children={<GoPencil />}
          />
        </div>
      </div>
    </div>
  );
}
