import { inbox } from "file-transfer";
const wsUri = "ws://192.168.100.30:3000/";

const websocket = new WebSocket(wsUri);

var stepsData = {};
var hrData={};
async function processAllFiles() {
  let file;
  while ((file = await inbox.pop())) {
    // console.log(file.name);
    if (file.name == "steps.txt") {
      const payload = await file.text();
      console.log(`Number of steps: ${payload}`);
      stepsData = payload;
    }
    else if (file.name == "heartRate.txt") {
      const payload = await file.text();
      console.log(`Current heart rate: ${payload}`);
      hrData=payload;
    }
  }
}

setInterval(() => {
  onOpen();
}, 1000);

websocket.addEventListener("open", onOpen);
function onOpen(evt) {
  // console.log("CONNECTED");
  websocket.send(JSON.stringify(stepsData));
  websocket.send(JSON.stringify(hrData));
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();



