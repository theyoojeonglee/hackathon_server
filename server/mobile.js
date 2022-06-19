const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const router = express.Router();
const app = express();
const PORT = 4000;
const MongoClient = require('mongodb').MongoClient;

dotenv.config();

const connectionString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.zbvca1i.mongodb.net/?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

app.listen(PORT, () => {
   console.log(`Listening to PORT: ${PORT}`);
})


MongoClient.connect(connectionString)
   .then(client => {
      console.log('Connected to Database');
      const db = client.db('Cluster0');

      router.get('/plant', (req, res) => {
         db.collection('plantData').find().toArray()
            .then(results => {
               console.log(results[results.length - 1]);
               res.send(results[results.length - 1]);
               res.end('ok');
            })
            .catch(error => console.error(error))
      })

      router.get('/water', (req, res) => {
         router.post('https://localhost:5000/water', (innerReq, innerRes) => {
            innerRes.send({"message": "waterCommand"});
            innerRes.end('ok');
         })
         res.end('ok');
      })

      router.post('/camera/direction', (req, res) => {
         router.post('https://localhost:5000/camera/direction', (innerReq, innerRes) => {
            innerRes.send({"message": req.body.message + "\nStop\n", "success": "true"});
            innerRes.end('ok');
         })
         res.end('ok');
      })

      router.post('/camera/location', (req, res) => {
         router.post('https://localhost:5000/camera/location', (innerReq, innerRes) => {
            innerRes.send({"message": req.body.message, "success": "true"});
            innerRes.end('ok');
         })
         res.end('ok');
      })

      router.put('/plant', (req, res) => {
         db.collection('plantData')
            .updateOne({ "plantID": req.body.plantID }, { $set: { "cameraPosition": req.body.cameraPosition } })
            .then(() => {
               console.log(req.body);
               res.end('ok');
            })
            .catch(error => console.error(error))
      })

   })
   .catch(console.error);
