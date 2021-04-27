const WebSocket = require("ws");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const ip = "192.168.100.30";
const wss = new WebSocket.Server({ port: 3000, host: ip });
var msgSteps = "";
var msgHR = "";
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
wss.on("connection", function connection(ws) {
  console.log("Client connected");
  ws.on("message", function incoming(message) {
    if (message.includes("steps")) {
      msgSteps = message;
    } else if (message.includes("heartRate")) {
      msgHR = message;
    }
  });
  // ws.send("something");

  setInterval(() => {
    var currentdate = new Date();

    var datetime =
      currentdate.getDate() +
      " " +
      monthNames[currentdate.getMonth()] +
      " " +
      currentdate.getFullYear() +
      " @ " +
      ((currentdate.getHours() < 10 ? "0" : "") + currentdate.getHours()) +
      ":" +
      ((currentdate.getMinutes() < 10 ? "0" : "") + currentdate.getMinutes()) +
      ":" +
      ((currentdate.getSeconds() < 10 ? "0" : "") + currentdate.getSeconds());

    const docRef = db.collection("stats").doc(`${datetime}`);

    //array pt datele live trimise spre websocket
    let toBeSent = [];
    //steps
    if (msgSteps != "" && msgSteps != {} && msgSteps != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgSteps));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "steps") {
          console.log(
            "Live steps: " + msgjson[Object.keys(msgjson)[msgLength - 1]]
          );
        }
      }
      toBeSent.push(msgjson[Object.keys(msgjson)[msgLength - 1]]);
    }
    //HR
    if (msgHR != "" && msgHR != {} && msgHR != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgHR));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "heartRate") {
          console.log(
            "Live HR: " + msgjson[Object.keys(msgjson)[msgLength - 1]]
          );
        }
      }
      toBeSent.push(msgjson[Object.keys(msgjson)[msgLength - 1]]);
    }
    console.log(toBeSent);
    if (toBeSent.length > 0) {
      setTimeout(() => {
        //  docRef.set ar trebui sa fie cu await nu cu timeout()
        docRef.set({
          steps: toBeSent[0],
          HR: toBeSent[1],
        });
      }, 0);
      ws.send(toBeSent);
    }
  }, 1000);
});

