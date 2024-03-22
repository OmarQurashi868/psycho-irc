const express = require('express');
const connectChannel = require("./channelConnect");

const router = express.Router();


router.get("/connect", connectChannel);

module.exports = router;