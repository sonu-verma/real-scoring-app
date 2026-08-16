import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
  console.log("WebSocket Server is live on ws://localhost:8080");
});

wss.on("connection", (socket, request) => {
  console.log("Client connected:", request.socket.remoteAddress);

  socket.on("message", (data) => {
    const message = data.toString();
    console.log("Received:", message);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server Broadcast: ${message}`);
      }
    });
  });

  socket.on("close", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error(err));
});

wss.on("error", (err) => {
  console.error("Server error:", err);
});