const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000, host: "192.168.100.30" });
var msg = "";
wss.on("connection", function connection(ws) {
  console.log("Client connected");
  ws.on("message", function incoming(message) {
    // console.log("received: %s", message);
    msg = message;
  });
  // msg+=message;
  ws.send("something");
});

setInterval(() => {
  if (msg != "" && msg != {} && msg != "{}") {
    console.log("pasi:" + msg);
  }
}, 5000);
