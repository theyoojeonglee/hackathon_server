const express = require('express');
const bodyParser = require('body-parser');
const arduino = express();
const mobile = express();

const plantData = {
};

let directionFlag = false;
let directionMessage = "camLeft";

let moveNum = -5;
let moveDirection = "";

let waterFlag = false;
let waterOffFlag = false;

const sleep = (ms) => {
   return new Promise(resolve=>{
       setTimeout(resolve,ms)
   })
}

arduino.use(bodyParser.json({strict: false}));
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
      console.log('sending water');
      waterOffFlag = true;
      res.send({"message": "waterTankOn", "success": "true"});
   }
   else if(waterOffFlag) {
      waterOffFlag = false;
      console.log('turning water off');
      await sleep(5000);
      res.send({"message": "waterTankOff", "success": "true"});
   }
   else if(moveNum > 0){
      console.log(`movenum ${moveNum}`)
      await sleep(1000);
      moveNum -= 5;
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
   else if(req.body.humidity){
      plantData.humidity = req.body.humidity;
      plantData.temperature = req.body.temperature;
      plantData.ambientHumidity = req.body.ambientHumidity;
      plantData.ph = req.body.ph;
      plantData.sun = req.body.sun;
      plantData.waterTank = req.body.waterTank;
   }
   console.log(plantData);
   res.end('ok');
})

// get plant data
mobile.get('/plant', (req, res) => {
   res.send(plantData);
})

// send water command to arduino
mobile.get('/water', (req, res) => {
   waterFlag = true;
   console.log('water');
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
   directionMessage = req.body.control;
   console.log('direction');
   res.send({"cameraPosition": plantData.cameraPosition});
})

// set camera position according to plant ID
mobile.put('/plant', (req, res) => {
   plantData.cameraPosition1 = plantData.cameraPosition;
   console.log(plantData.cameraPosition1);
   res.end('ok');
})

// move camera location
mobile.post('/camera/location', (req, res) => {
   let targetCameraPosition = plantData.cameraPosition1;
   // if(req.body.plantId == 1) targetCameraPosition = plantData.cameraPosition1;
   // else targetCameraPosition = plantData.cameraPosition2;

   moveNum = Math.abs(targetCameraPosition - plantData.cameraPosition);

   if(req.body.targetCameraPosition > plantData.cameraPosition) moveDirection = "camRight";
   else moveDirection = "camLeft";
   console.log(`move ${moveNum}`);

   res.end('ok');
})
