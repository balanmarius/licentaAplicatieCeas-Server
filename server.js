const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000, host: "192.168.100.30" });
var msg = "";
wss.on("connection", function connection(ws) {
  console.log("Client connected");
  ws.on("message", function incoming(message) {
    // console.log("received %s", message);
    msg = message;
  });
  // ws.send("something");

  setInterval(() => {
    if (msg != "" && msg != {} && msg != "{}") {
      console.log("pasi:" + msg);
      let msgjson = JSON.parse(JSON.parse(msg));
      // console.log(Object.keys(msgjson).sort());
      msgLength=Object.keys(msgjson).length;
      // console.log(msgLength)
      if(msgLength>0){
        console.log(msgjson[Object.keys(msgjson)[msgLength-1]]);
      }
      // console.log(msgjson[Object.keys(msgjson).sort()][msgLength]);
      ws.send(msgjson[Object.keys(msgjson)[msgLength-1]]);
      // ws.send(msg);
    }
  }, 1000);
});

// setInterval(() => {
//   if (msg != "" && msg != {} && msg != "{}") {
//     console.log("pasi:" + msg);
//     let msgjson = JSON.parse(JSON.parse(msg));
//     // getLastValue(msgjson);
//     last = getLastValue(msgjson);
//     console.log(last);
//     // wss.on("connection", function connection(ws){
//     //   ws.send(last);
//     // });
//   }
// }, 5000);

