import express from 'express';
import bodyParser from 'body-parser';
const app = express()
const PORT = 3000

import userRouter from "./users.js";
import verifyToken from './userauth.js';

app.use(bodyParser.json());

app.use("/users", userRouter);

app.use(verifyToken);

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})