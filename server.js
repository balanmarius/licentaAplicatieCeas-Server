const WebSocket = require("ws");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// const ip="192.168.62.53";
const ip = "192.168.100.30";
// const ip = "127.0.0.1";
const wss = new WebSocket.Server({ port: 3000, host: ip });
var msgActivity = "";
var msgHR = "";
var msgGeolocation = "";
var msgAccelerometer = "";
var msgBarometer = "";

wss.on("connection", function connection(ws) {
  console.log("Client connected");
  ws.on("message", function incoming(message) {
    //mesajul e jsonul, la includes este stringul de la id
    if (message.includes("activity")) {
      msgActivity = message;
    } else if (message.includes("heartRate")) {
      msgHR = message;
    } else if (message.includes("geolocation")) {
      msgGeolocation = message;
    } else if (message.includes("accelerometer")) {
      msgAccelerometer = message;
    } else if (message.includes("barometer")) {
      msgBarometer = message;
    }
  });

  setInterval(() => {
    var currentdate = new Date();

    var datetime =
      ("0" + (currentdate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentdate.getDate()).slice(-2) +
      "-" +
      currentdate.getFullYear() +
      " @ " +
      ("0" + currentdate.getHours()).slice(-2) +
      ":" +
      ("0" + currentdate.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentdate.getSeconds()).slice(-2);

    const docRef = db.collection("stats").doc(`${datetime}`);

    //array pt datele live trimise spre websocket
    let toBeSent = [];
    //steps
    if (msgActivity != "" && msgActivity != {} && msgActivity != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgActivity));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "activity") {
          console.log("Live steps: " + msgjson["current steps"]);
          console.log("Live calories: " + msgjson["current calories"]);
          console.log("Live floors: " + msgjson["current floors"]);
          console.log("Live distance: " + msgjson["current distance"]);
          console.log("Live Active Minutes: " + msgjson["current AM"]);
        }
      }
      toBeSent.push(msgjson["current steps"]);
      toBeSent.push(msgjson["current calories"]);
      toBeSent.push(msgjson["current floors"]);
      toBeSent.push(msgjson["current distance"]);
      toBeSent.push(msgjson["current AM"]);
    }
    //HR
    if (msgHR != "" && msgHR != {} && msgHR != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgHR));
      msgLength = Object.keys(msgjson).length;

      if (msgLength > 0) {
        if (msgjson.id == "heartRate") {
          console.log("Live HR: " + msgjson["current hr"]);
        }
      }
      if (msgjson["current hr"] == undefined) {
        msgjson["current hr"] = "unavailable";
      }
      toBeSent.push(msgjson["current hr"]);
    }
    //geolocation
    if (
      msgGeolocation != "" &&
      msgGeolocation != {} &&
      msgGeolocation != "{}"
    ) {
      let msgjson = JSON.parse(JSON.parse(msgGeolocation));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "geolocation") {
          console.log(
            "Latitude: " +
              msgjson["latitude"] +
              "\n" +
              "Longitude: " +
              msgjson["longitude"]
          );
        }
      }
      if (
        msgjson["latitude"] == undefined &&
        msgjson["longitude"] == undefined
      ) {
        msgjson["latitude"] = "unavailable";
        msgjson["longitude"] = "unavailable";
      }
      toBeSent.push(msgjson["latitude"]);
      toBeSent.push(msgjson["longitude"]);
    }
    //accelerometer
    if (
      msgAccelerometer != "" &&
      msgAccelerometer != {} &&
      msgAccelerometer != "{}"
    ) {
      let msgjson = JSON.parse(JSON.parse(msgAccelerometer));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "accelerometer") {
          console.log(
            "x:  " +
              msgjson["x"] +
              "\n" +
              "y: " +
              msgjson["y"] +
              "\n" +
              "z: " +
              msgjson["z"]
          );
        }
      }
      toBeSent.push(msgjson["x"]);
      toBeSent.push(msgjson["y"]);
      toBeSent.push(msgjson["z"]);
    }
    //barometer
    if (msgBarometer != "" && msgBarometer != {} && msgBarometer != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgBarometer));
      msgLength = Object.keys(msgjson).length;

      if (msgLength > 0) {
        if (msgjson.id == "barometer") {
          console.log(
            "Live barometer pressure: " + msgjson["barometer pressure"]
          );
        }
      }
      if (msgjson["barometer pressure"] == undefined) {
        msgjson["barometer pressure"] = "unavailable";
      }
      toBeSent.push(msgjson["barometer pressure"]);
    }
    // console.log(toBeSent);
    if (toBeSent.length > 0) {
      setTimeout(() => {
        //  docRef.set ar trebui sa fie cu await nu cu timeout()
        docRef.set({
      date: currentdate,
      steps: toBeSent[0],
          calories: toBeSent[1] != undefined ? toBeSent[1] : "unavailable",
          floors: toBeSent[2] != undefined ? toBeSent[2] : "unavailable",
          distance: toBeSent[3] != undefined ? toBeSent[3] : "unavailable",
          "active minutes": toBeSent[4] != undefined ? toBeSent[4] : "unavailable",
          HR: toBeSent[5] != undefined ? toBeSent[5] : "unavailable",
          latitude: toBeSent[6] != undefined ? toBeSent[6] : "unavailable",
          longitude: toBeSent[7] != undefined ? toBeSent[7] : "unavailable",
          accelerometerX:
            toBeSent[8] != undefined ? toBeSent[8] : "unavailable",
          accelerometerY:
            toBeSent[9] != undefined ? toBeSent[9] : "unavailable",
          accelerometerZ:
            toBeSent[10] != undefined ? toBeSent[10] : "unavailable",
          "barometer pressure":
            toBeSent[11] != undefined ? toBeSent[11] : "unavailable",
        });
      }, 0);
      ws.send(toBeSent.toString());
    }
  }, 1000);

  setInterval(() => {
    var currentdate = new Date();
    var datetime =
      ("0" + (currentdate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentdate.getDate()).slice(-2) +
      "-" +
      currentdate.getFullYear() +
      " @ " +
      ("0" + currentdate.getHours()).slice(-2) +
      ":" +
      ("0" + currentdate.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentdate.getSeconds()).slice(-2);

    const docRef = db.collection("stepsGraph").doc(`${datetime}`);

    let toBeSent = [];
    //steps
    if (msgActivity != "" && msgActivity != {} && msgActivity != "{}") {
      let msgjson = JSON.parse(JSON.parse(msgActivity));
      msgLength = Object.keys(msgjson).length;
      if (msgLength > 0) {
        if (msgjson.id == "activity") {
          console.log("Live steps: " + msgjson["current steps"]);
        }
      }
      toBeSent.push(msgjson["current steps"]);
    }
    if (toBeSent.length > 0) {
      setTimeout(() => {
        docRef.set({
          date: currentdate,
          steps: toBeSent[0],
        });
      }, 0);
    }
  }, 60000);
});
// toBeSent: steps,calories,floors,distance,AM,hr,lat,long,accelX,accelY,accelZ,barometerpressure
