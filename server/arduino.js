const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
   console.log(`Listening to PORT: ${PORT}`);
})

app.post('/plant', (req, res) => {
   console.log(req.body);
   res.send("ok");
})
