const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { fromZodError } = require('zod-validation-error');
const User = require("../classes/user");
const Token = require("../classes/token");

const SALTROUNDS = 10;
const router = express.Router();

const registerUserSchema = z.object({
    username: z.string(),
    password: z.string(),
    passwordConfirmation: z.string()
})
    .refine(schema => schema.password == schema.passwordConfirmation, "Passwords do not match");

const loginUserSchema = z.object({
    username: z.string(),
    password: z.string()
});

const loginUser = async (req, res) => {
    try {
        loginUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400);
        res.send({ message: validationError });
        return
    }

    const userQueryResult = await User.find(req.body.username);
    const userNotExist = userQueryResult == null;
    if (userNotExist) {
        res.status(400);
        res.send({ message: "Username not found" });
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        res.status(400);
        res.send({ message: "Password incorrect" });
        return;
    }

    const userId = userQueryResult['id'];

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    res.status(200);
    res.send({ token });

}

const registerUser = async (req, res) => {
    try {
        registerUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400);
        res.send({ message: validationError });
        return;
    }

    const userQueryResult = await User.find(req.body.username);
    const userAlreadyExists = userQueryResult != null;
    if (userAlreadyExists) {
        res.status(400);
        res.send({ message: "Username already registered" });
        return;
    }

    let newUser = {};
    newUser['username'] = req.body.username;
    newUser['password'] = await bcrypt.hash(req.body.password, SALTROUNDS);

    const userId = await User.insert(newUser);

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    res.status(201);
    res.send({ token });
}

const generateToken = async (userId) => {
    const randomHalfToken = () => Math.random().toString(36).substring(2);
    const token = randomHalfToken() + randomHalfToken();

    const THREEHOURS = 3 * 60 * 60 * 1000;
    // eslint-disable-next-line no-unused-vars
    const FIVESECONDS = 5 * 1000;
    let expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + THREEHOURS);

    await Token.insert({ token, userId, expiryDate })
    return token;
}

router.get("/login", loginUser)
router.post("/register", registerUser)

module.exports = { router, loginUser, registerUser };