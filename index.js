const express = require('express');
const bodyParser = require('body-parser');
const arduino = express();
const mobile = express();

const plantData = {};

let directionFlag = false;
let directionMessage = "";

let moveNum = 0;
let moveDirection = "";

let waterFlag = false;

arduino.use(bodyParser.json());
arduino.use(bodyParser.urlencoded({ extended: true }));

mobile.use(bodyParser.json());
mobile.use(bodyParser.urlencoded({ extended: true }));

arduino.listen(5000, () => {
   console.log(`Listening to PORT: 5000`);
})

mobile.listen(4000, () => {
   console.log(`Listening to PORT: 4000`);
})

// move arduino on mobile direction or location command
arduino.get('/', async (req, res) => {
   if(directionFlag) {
      try {
         directionFlag = false;
         res.send({"message": directionMessage, "success": "true"});
      } catch (err) {
         console.log(err);
      }
   }
   else if(waterFlag) {
      waterFlag = false;
      res.send({"message": "waterCommand", "success": "true"});
   }
   else if(moveNum > 0){
      moveNum -= 2;
      res.send({"message": moveDirection, "success": "true"});
   }
   else {
      res.end('ok');
      moveNum = 0;
   }
})

// get camera position or sensor data from arduino periodically
arduino.post('/', (req, res) => {
   if(req.body.cameraPosition) {
      plantData.cameraPosition = req.body.cameraPosition;
   }
   else {
      plantData.humidity = req.body.humidity;
      plantData.temperature = req.body.temperature;
      plantData.ambientHumidity = req.body.ambientHumidity;
      plantData.ph = req.body.ph;
      plantData.sun = req.body.sun;
      plantData.waterTank = req.body.waterTank;
   }
   res.end('ok');
})

// get plant data
mobile.get('/plant', (req, res) => {
   res.send(plantData);
})

// send water command to arduino
mobile.get('/water', (req, res) => {
   waterFlag = true;
   res.end('ok');
})

// give current camera position
// need to check if this is needed
mobile.get('/camera/direction', (req, res) => {
   res.send({"cameraPosition": plantData.cameraPosition});
})

// set direction for arduino to move on mobile command
mobile.post('/camera/direction', (req, res) => {
   directionFlag = true;
   message = req.body.control;
   res.send({"cameraPosition": plantData.cameraPosition});
})

// set camera position according to plant ID
mobile.put('/plant', (req, res) => {
   if(req.body.plantID == '1') plantData.cameraPosition1 = req.body.cameraPosition;
   else plantData.cameraPosition2 = req.body.cameraPosition;
   res.end('ok');
})

// move camera location
mobile.post('/camera/location', (req, res) => {
   let targetCameraPosition;
   if(req.body.plantID == "1") targetCameraPosition = plantData.cameraPosition1;
   else targetCameraPosition = plantData.cameraPosition2;

   moveNum = Math.abs(targetCameraPosition - plantData.cameraPosition);

   if(req.body.targetCameraPosition > plantData.cameraPosition) moveDirection = "camLeft";
   else moveDirection = "camRight";

   res.end('ok');
})
