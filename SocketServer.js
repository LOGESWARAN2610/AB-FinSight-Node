const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    // You can send a message back to the client
  });
  setTimeout(() => {
    ws.send("2500");
  }, 2500);

  setTimeout(() => {
    ws.send("10000");
  }, 10000);
});
