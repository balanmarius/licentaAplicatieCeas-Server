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
  const hrm = new HeartRateSensor({ frequency: 1 });
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

//////////////////////////////////////operatii cu fisiere//////https://dev.fitbit.com/build/guides/file-system///////se pot sterge se pot redenumi
function file_exists(filename) {
  let dirIter = "";
  let listDir = listDirSync("");
  while((dirIter = listDir.next()) && !dirIter.done) if(dirIter.value===filename) return true;
  return false;
}
if(file_exists("json.txt")) {
  console.log("exists!");
} else {
  console.log("doesn't exist!");
}

let json_data = {};
fs.writeFileSync("json.txt", json_data, "json");
// let json_object  = fs.readFileSync("json.txt", "json");
// console.log("JSON guid: " + json_object.name);

import { outbox } from "file-transfer";

setInterval(() => {
  outbox
    .enqueueFile("/private/data/json.txt");
  var currentdate = new Date(); 
  var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds(); 
  let steps_data  = fs.readFileSync("json.txt", "json");
  steps_data[`${datetime}`]=todayStats.adjusted.steps
  fs.writeFileSync("json.txt", steps_data, "json");
}, 1000);









//pt a vedea fisierele din /private/data
// import { listDirSync } from "fs";
// const listDir = listDirSync("/private/data");
// do {
//   const dirIter = listDir.next();
//   if (dirIter.done) {
//     break;
//   }
//   console.log(dirIter.value);
// } while (true);
