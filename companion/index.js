import { inbox } from "file-transfer";
const wsUri = "ws://192.168.100.30:3000/";

const websocket = new WebSocket(wsUri);

var stepsData = {};
async function processAllFiles() {
  let file;
  while ((file = await inbox.pop())) {
    const payload = await file.text();
    console.log(`Number of steps: ${payload}`);
    stepsData=payload;
  }
}

setInterval(() => {
  onOpen();
}, 1000);

websocket.addEventListener("open", onOpen);
function onOpen(evt) {
  // console.log("CONNECTED");
  // websocket.send("ok");
  websocket.send(JSON.stringify(stepsData));
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();
