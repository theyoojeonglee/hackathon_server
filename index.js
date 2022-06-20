const express = require('express');
const bodyParser = require('body-parser');
const arduino = express();
const mobile = express();

const plantData = {};

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

arduino.post('/plant', (req, res) => {
   plantData.plantID = req.body.plantID;
   plantData.humidity = req.body.humidity;
   plantData.temperature = req.body.temperature;
   plantData.pH = req.body.pH;
   plantData.sunlight = req.body.sunlight;
   plantData.cameraPosition = req.body.cameraPosition;
   res.end('ok');
})

mobile.get('/plant', (req, res) => {
   res.send(plantData);
})

mobile.get('/water', (req, res) => {
   router.post('https://localhost:5000/water', (innerReq, innerRes) => {
      innerRes.send({ "message": "waterCommand" });
      innerRes.end('ok');
   })
   res.end('ok');
})

mobile.post('/camera/direction', (req, res) => {
   router.post('https://localhost:5000/camera/direction', (innerReq, innerRes) => {
      innerRes.send({ "message": req.body.message + "\nStop\n", "success": "true" });
      innerRes.end('ok');
   })
   res.end('ok');
})

mobile.post('/camera/location', (req, res) => {
   router.post('https://localhost:5000/camera/location', (innerReq, innerRes) => {
      innerRes.send({ "message": req.body.message, "success": "true" });
      innerRes.end('ok');
   })
   res.end('ok');
})

mobile.put('/plant', (req, res) => {
   plantData.cameraPosition = req.body.cameraPosition;
   res.end('ok');
})
