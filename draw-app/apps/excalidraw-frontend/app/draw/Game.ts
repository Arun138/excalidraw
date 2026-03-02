import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

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
      type: "pencil";
      coordinates: [number, number][];
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private pencilCoordinates: [number, number][] = [];
  private selectedTool: Tool = "circle";

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!; // "!" means “trust me, it isn’t null”
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  setTool(tool: "circle" | "pencil" | "rect") {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();

    this.ctx.shadowBlur = 1;
    this.ctx.shadowColor = "rgba(0,0,0,0.3)";
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // erasing the previous rectange in each mousemove

    this.ctx.fillStyle = "rgba(0,0,0)"; // Making it default: selecting black color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Making it default: rendering black (selected above) as bg color

    // Render all shapes
    this.existingShapes.map((shape) => {

      this.ctx.strokeStyle = "rgba(255,255,255)";
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height); // draw the rectange in each mousemove
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        let startXY: [number, number];
        if (shape.coordinates.length === 1) {
          startXY = shape.coordinates[0];
          this.ctx.moveTo(startXY[0], startXY[1]);
          this.ctx.lineTo(startXY[0], startXY[1]);
          this.ctx.stroke();
        }
        if (shape.coordinates.length > 1) {
          startXY = shape.coordinates[0];
          shape.coordinates.slice(1).map((coordinate) => {
            let [endX, endY] = coordinate;
            this.ctx.moveTo(startXY[0], startXY[1]);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            startXY = [endX, endY];
          });
        }
      }
    });
  }

  mouseDownhandler = (e) => {
    // If we use regular function (function () {---}),'this' refers to the HTMLCanvasElement (the object that triggered the event; here the 'canvas'), not your Game instance. When you write "this.clicked = true", the compiler thinks you're trying to set a property on the 'canvas' element, which doesn't have a 'clicked' property. Solution – use an arrow function . Arrow functions preserve the outer 'this' context, so 'this' will point to your Game instance.
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e) => {
    this.clicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    // @ts-ignore
    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + width / 2,
        centerY: this.startY + height / 2,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        coordinates: this.pencilCoordinates,
      };
      this.pencilCoordinates = [];
    }

    if (!shape) {
      return;
    }
    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      }),
    );
  };

  mouseMoveHandler = (e) => {
    if (!this.clicked) {
      return;
    }
    if (this.selectedTool !== "pencil") {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255,255,255)";
      // @ts-ignore
      const selectedTool = this.selectedTool;
      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height); // draw the rectange in each mousemove
        // ctx.strokeRect(100,25,10,100) // .strokeRect(x-coordinte in screen,y-coordinte in screen,width of the rectange, length of the rectangle)
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }

    if (this.selectedTool === "pencil") {
      // this.ctx.globalAlpha = 0.85;

      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(e.clientX, e.clientY);
      this.ctx.stroke();
      this.pencilCoordinates.push([this.startX, this.startY]);
      [this.startX, this.startY] = [e.clientX, e.clientY];
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownhandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownhandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }
}
