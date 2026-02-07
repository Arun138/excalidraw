import { WebSocketServer } from "ws";

let wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    ws.send("pong");
  });
});
