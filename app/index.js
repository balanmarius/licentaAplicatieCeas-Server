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

///geolocation

geolocation.getCurrentPosition(locationSuccess, locationError, {
  timeout: 60 * 1000,
});

function locationSuccess(position) {
  console.log(
    "Latitude: " + position.coords.latitude,
    "Longitude: " + position.coords.longitude
  );
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}

//////////////////////////////////////
if (fs.existsSync("/private/data/steps.txt")) {
  console.log("file exists!");
}

let json_steps = {};
json_steps["id"] = "steps";
fs.writeFileSync("steps.txt", json_steps, "json");
let json_hr = {};
json_hr["id"] = "heartRate";
fs.writeFileSync("heartRate.txt", json_hr, "json");
// let json_object  = fs.readFileSync("json.txt", "json");
// console.log("JSON guid: " + json_object.name);
// import * as fs from "fs";
// fs.unlinkSync("json.txt");
import { listDirSync } from "fs";
const listDir = listDirSync("/private/data");
do {
  const dirIter = listDir.next();
  if (dirIter.done) {
    break;
  }
  console.log(dirIter.value);
} while (true);

// var currentdate = new Date();
//de incercat sa trimit ultima data live sub forma de {pasi live: val}, iar din server.js sa trimit in cloud json cu{data live: val}
function generateData() {
  // var currentdate = new Date();
  // var datetime =
  //   currentdate.getDate() +
  //   "/" +
  //   (currentdate.getMonth() + 1) +
  //   "/" +
  //   currentdate.getFullYear() +
  //   " @ " +
  //   currentdate.getHours() +
  //   ":" +
  //   currentdate.getMinutes() +
  //   ":" +
  //   currentdate.getSeconds();
  let json_steps = fs.readFileSync("steps.txt", "json");
  // json_steps[`${datetime}`] = todayStats.adjusted.steps;
  json_steps["current steps"] = todayStats.adjusted.steps;
  fs.writeFileSync("steps.txt", json_steps, "json");
  outbox.enqueueFile("/private/data/steps.txt");

  let json_hr = fs.readFileSync("heartRate.txt", "json");
  // json_hr[`${datetime}`] = `${hrm.heartRate}`;
  json_hr["current hr"] = `${hrm.heartRate}`;
  fs.writeFileSync("heartRate.txt", json_hr, "json");
  outbox.enqueueFile("/private/data/heartRate.txt");

  // console.log(fs.statSync("steps.txt").size+' bytes')
  // console.log(fs.statSync("heartRate.txt").size+' bytes')
  // console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
}

setInterval(() => {
  generateData();
}, 1000);
