const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const arduino = express();
const mobile = express();

const plantData = {};

let flag = false;
let message;
let moveNum = 0;
let moveDirection;

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

// save
// 계속 위치 받음, 앱이 위치 달라고 하면 서버가 준다.


/**
 * 1. 앱이 current position 달라고 하면 주기
 * 2. 앱이 이 식물 포지션으로 가라고 하면 해당 포지션에 따라서 왼쪽 오른쪽으로 가라고 아두이노에게 명령
 *
 */

mobile.get('/plant', (req, res) => {
   res.send(plantData);
})

mobile.get('/water', (req, res) => {
   router.post('https://ip-of-arduino:5000/water', (innerReq, innerRes) => { //router or arduino
      innerRes.send({ "message": "waterCommand" });
      innerRes.end('ok');
   })
   res.end('ok');
})

arduino.get('/', async (req, res) => {
   if(flag) {
      try {
         console.log(flag, message);
         flag = false;
         res.send({"message": message, "success": "true"});
      } catch (err) {
         console.log(err);
      }
   }
   else if(moveNum > 0){
      console.log('movenum');
      console.log(moveNum);
      moveNum -= 2;
      res.send({"message": moveDirection, "success": "true"});
   }
   else {
      res.end('ok');
      moveNum = 0;
   }
})

mobile.post('/camera/position', (req, res) => {
   flag = true;
   message = req.body.control;
   res.send('ok');
})

mobile.post('/camera/location', (req, res) => {
   moveNum = Math.abs(req.body.cameraPosition - plantData.cameraPosition);
   if(req.body.cameraPosition > plantData.cameraPosition) moveDirection = "camLeft";
   else moveDirection = "camRight";
   res.end('ok');
})

mobile.put('/plant', (req, res) => {
   if(req.body.plantID == '1') plantData.cameraPosition1 = req.body.cameraPosition;
   else plantData.cameraPosition2 = req.body.cameraPosition;
   console.log(plantData);
   res.end('ok');
})
