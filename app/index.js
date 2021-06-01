import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { today as todayStats } from "user-activity";
import { geolocation } from "geolocation";
import * as fs from "fs";
import { listDirSync } from "fs";
import { outbox } from "file-transfer";
import { memory } from "system";
import * as messaging from "messaging";
import { Accelerometer } from "accelerometer";
import { Barometer } from "barometer";

// Update the clock every minute
clock.granularity = "seconds";

// Get a handle on the <text> element
const hoursLabel = document.getElementById("hoursLabel");
const minutesLabel = document.getElementById("minutesLabel");
const secondsLabel = document.getElementById("secondsLabel");
const heartRateLabel = document.getElementById("heartRateLabel");
const caloriesLabel = document.getElementById("caloriesLabel");
const footStepsLabel = document.getElementById("footStepsLabel");
const ampmLabel = document.getElementById("ampmLabel");
const monthLabel = document.getElementById("monthLabel");
const dayLabel = document.getElementById("dayLabel");
const weekDayLabel = document.getElementById("weekDayLabel");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  if (appbit.permissions.granted("access_activity")) {
    footStepsLabel.text = `${todayStats.adjusted.steps}`;
    caloriesLabel.text = `${todayStats.adjusted.calories}`;
  }

  showDate(evt);
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    if (hours / 12 > 0) {
      ampmLabel.text = "PM";
    } else {
      ampmLabel.text = "AM";
    }
    hours = hours % 12 || 12;
  } else {
    // 24h format
    ampmLabel.text = "";
    hours = util.zeroPad(hours);
  }
  //let hours = util.zeroPad(today.getHours());
  let minutes = util.zeroPad(today.getMinutes());
  let seconds = util.zeroPad(today.getSeconds());
  hoursLabel.text = `${hours}`;
  minutesLabel.text = `${minutes}`;
  secondsLabel.text = `${seconds}`;
};

function showDate(evt) {
  let today = evt.date;
  let weekDay = today.getDay();
  let monthNumber = today.getMonth();
  let day = today.getDate();
  let months = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let monthName = months[monthNumber];
  weekDayLabel.text = days[weekDay] + ",";
  monthLabel.text = `${monthName}`;
  dayLabel.text = `${day}`;
}

if (HeartRateSensor) {
  var hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    // console.log(`Current heart rate : ${hrm.heartRate}`);
    heartRateLabel.text = `${hrm.heartRate}`;
  });
  hrm.start();
}

if (Accelerometer) {
  console.log("This device has an Accelerometer!");
  const accelerometer = new Accelerometer({ frequency: 1 });
  accelerometer.addEventListener("reading", () => {
    // console.log(
    //   `Accelerometer reading: ${accelerometer.x},${accelerometer.y},${accelerometer.z}`
    // );
  });
  accelerometer.start();
} else {
  console.log("This device does NOT have an Accelerometer!");
}

if (Barometer) {
  console.log("has barometer");
  const barometer = new Barometer({ frequency: 1 });
  barometer.addEventListener("reading", () => {
    // console.log(`Pressure: ${barometer.pressure} Pa`);
  });
  barometer.start();
} else {
  console.log("no barometer");
}

//////////////////////////////////////
// if (fs.existsSync("/private/data/steps.txt")) {
//   console.log("file exists!");
// }

let json_activity = {};
json_activity["id"] = "activity";
fs.writeFileSync("activity.txt", json_activity, "json");

let json_hr = {};
json_hr["id"] = "heartRate";
fs.writeFileSync("heartRate.txt", json_hr, "json");

let json_geolocation = {};
json_geolocation["id"] = "geolocation";
fs.writeFileSync("geolocation.txt", json_geolocation, "json");

let json_accelerometer = {};
json_accelerometer["id"] = "accelerometer";
fs.writeFileSync("accelerometer.txt", json_accelerometer, "json");

let json_barometer = {};
json_barometer["id"] = "barometer";
fs.writeFileSync("barometer.txt", json_barometer, "json");


// let json_object  = fs.readFileSync("json.txt", "json");
// console.log("JSON guid: " + json_object.name);
// import * as fs from "fs";
// fs.unlinkSync("json.txt");

import { listDirSync } from "fs";
import { bin } from "npm";
const listDir = listDirSync("/private/data");
do {
  const dirIter = listDir.next();
  if (dirIter.done) {
    break;
  }
  console.log(dirIter.value);
} while (true);

function generateData() {
  let json_activity = fs.readFileSync("activity.txt", "json");
  json_activity["current steps"] = todayStats.adjusted.steps;
  json_activity["current calories"] = todayStats.adjusted.calories;
  json_activity["current floors"] = todayStats.adjusted.elevationGain;
  json_activity["current distance"] = todayStats.adjusted.distance;
  json_activity["current AM"] = todayStats.adjusted.activeZoneMinutes.total;
  fs.writeFileSync("activity.txt", json_activity, "json");
  outbox.enqueueFile("/private/data/activity.txt");

  let json_hr = fs.readFileSync("heartRate.txt", "json");
  json_hr["current hr"] = hrm.heartRate;
  fs.writeFileSync("heartRate.txt", json_hr, "json");
  outbox.enqueueFile("/private/data/heartRate.txt");

  let json_geolocation = fs.readFileSync("geolocation.txt", "json");
  geolocation.getCurrentPosition(function (position) {
    json_geolocation["latitude"] = position.coords.latitude;
    json_geolocation["longitude"] = position.coords.longitude;
    fs.writeFileSync("geolocation.txt", json_geolocation, "json");
  });
  outbox.enqueueFile("/private/data/geolocation.txt");

  let json_accelerometer = fs.readFileSync("accelerometer.txt", "json");
  json_accelerometer["x"] = accelerometer.x;
  json_accelerometer["y"] = accelerometer.y;
  json_accelerometer["z"] = accelerometer.z;
  fs.writeFileSync("accelerometer.txt", json_accelerometer, "json");
  outbox.enqueueFile("/private/data/accelerometer.txt");

  let json_barometer = fs.readFileSync("barometer.txt", "json");
  json_barometer["barometer pressure"] = barometer.pressure;
  fs.writeFileSync("barometer.txt", json_barometer, "json");
  outbox.enqueueFile("/private/data/barometer.txt");

  

  // console.log(fs.statSync("geolocation.txt").size+' bytes');
  console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
}

setInterval(() => {
  generateData();
  // console.log(todayStats.adjusted.calories); // calorii
  // console.log(todayStats.adjusted.elevationGain); //floors
  // console.log(todayStats.adjusted.distance);  //distanta in metri
  // console.log(`${todayStats.adjusted.activeZoneMinutes.total} Active Minutes`);  //total=cardio+fatBurn+peak -> pot fi luate si separat
}, 1000);
//nu are giroscop+orientare
