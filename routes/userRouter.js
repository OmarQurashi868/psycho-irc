const express = require('express');
const userLogin = require("./userLogin");
const userRegister = require("./userRegister");

const router = express.Router();


router.get("/login", userLogin);
router.post("/register", userRegister);

module.exports = router;