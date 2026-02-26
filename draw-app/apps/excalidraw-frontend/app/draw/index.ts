import axios from "axios";
import { HTTP_BACKEND } from "../config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "ellipse";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    };

export default async function InitDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
  choosenShape: {current:string},
) {
  const ctx = canvas.getContext("2d"); // getting the context of the canvas

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked: boolean = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    let shape: Shape;
    console.log('choosenShape:',choosenShape.current);
    

    if (choosenShape.current == "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        height,
        width,
      };
    } else if (choosenShape.current == "circle") {
      shape = {
        type: "circle",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        radius:  Math.abs(width/2),
      };
    } else {
      shape = {
        type: "ellipse",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        radiusX:  Math.abs(width/2),
        radiusY:  Math.abs(height/2),
      };
    }

    existingShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      }),
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255,255,255)";
      if (choosenShape.current == "rect") {
        ctx.strokeRect(startX, startY, width, height); // draw the rectange in each mousemove
        // ctx.strokeRect(100,25,10,100) // .strokeRect(x-coordinte in screen,y-coordinte in screen,width of the rectange, length of the rectangle)
      } else if (choosenShape.current == "circle") {
        ctx.beginPath();
        ctx.arc(startX + width/2 , startY + height / 2, Math.abs(width/2), 0, Math.PI * 2); // wider than tall
        ctx.stroke();
      } else {
        ctx.beginPath();
ctx.ellipse(startX + width/2 , startY + height / 2, Math.abs(width/2), Math.abs(height/2), 0, 0, Math.PI * 2); // wider than tall
        ctx.stroke();
      }
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // erasing the previous rectange in each mousemove

  ctx.fillStyle = "rgba(0,0,0)"; // Making it default: selecting black color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Making it default: rendering black (selected above) as bg color

  // Render all shapes
  existingShapes.map((shape) => {
    ctx.strokeStyle = "rgba(255,255,255)";
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height); // draw the rectange in each mousemove
    } else if (shape.type === "circle") {
      // ctx.strokeStyle = "rgba(255,255,255)";
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius,  0, Math.PI * 2); // draw the circle in each mousemove
        ctx.stroke();
    
    } else  {
      ctx.beginPath();
      ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX,shape.radiusY,0,  0, Math.PI * 2); // draw the ellipse in each mousemove
        ctx.stroke();
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
