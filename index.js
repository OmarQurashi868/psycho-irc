const express = require('express');
const bodyParser = require('body-parser');
const app = express()
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;

const userRouter = require("./routes/userRouter.js");
const { verifyToken } = require('./utils/userAuth.js');
const initTables = require('./utils/database.js');

initTables();

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World');
})

app.use("/users", userRouter);

app.use(verifyToken);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})