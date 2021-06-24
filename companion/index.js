import { inbox } from "file-transfer";
const wsUri = "ws://192.168.100.30:3000/";
// const wsUri = "ws://127.0.0.1:3000/";

const websocket = new WebSocket(wsUri);

var activityData = {};
var hrData = {};
var geolocationData = {};
var accelerometerData = {};
var barometerData = {};

async function processAllFiles() {
  let file;
  while ((file = await inbox.pop())) {
    // console.log(file.name);
    if (file.name == "activity.txt") {
      const payload = await file.text();
      // console.log(`Number of steps: ${payload}`);
      activityData = payload;
    } else if (file.name == "heartRate.txt") {
      const payload = await file.text();
      // console.log(`Current heart rate: ${payload}`);
      hrData = payload;
    } else if (file.name == "geolocation.txt") {
      const payload = await file.text();
      // console.log(`Current coordinates: ${payload}`);
      geolocationData = payload;
    } else if (file.name == "accelerometer.txt") {
      const payload = await file.text();
      // console.log(`Current coordinates: ${payload}`);
      accelerometerData = payload;
    } else if (file.name == "barometer.txt") {
      const payload = await file.text();
      // console.log(`Current barometer pressure: ${payload}`);
      barometerData = payload;
    }
  }
}

setInterval(() => {
  onOpen();
}, 1000);

websocket.addEventListener("open", onOpen);
function onOpen(evt) {
  // console.log("CONNECTED");
  websocket.send(JSON.stringify(activityData));
  websocket.send(JSON.stringify(hrData));
  websocket.send(JSON.stringify(geolocationData));
  websocket.send(JSON.stringify(accelerometerData));
  websocket.send(JSON.stringify(barometerData));
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();
