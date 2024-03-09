const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const PORT = 3000

const { router: userRouter } = require("./routes/users.js");
const verifyToken = require('./utils/userAuth.js');
const initTables = require('./utils/database.js');

initTables();

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.use("/users", userRouter);

app.use(verifyToken);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})