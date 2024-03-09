const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { fromZodError } = require('zod-validation-error');
const knex = require('knex');

const SALTROUNDS = 10;
const router = express.Router();

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './database.db',
    },
    useNullAsDefault: true,
});


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
        res.status(400).send({ message: validationError });
        return
    }

    const userQueryResult = await db.select().table("users").where({ username: req.body.username }).first();
    const userNotExist = userQueryResult.length < 1
    if (userNotExist) {
        res.status(400).send({ message: "Username not found" });
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        res.status(400).send({ message: "Password incorrect" });
        return;
    }

    const userId = userQueryResult['id'];

    await deleteExistingTokens(userId);
    const token = await generateToken(userId);

    res.status(200).send({ token });

}

const registerUser = async (req, res) => {
    try {
        registerUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400).send({ message: validationError });
        return;
    }

    const userQueryResult = await db.select().table("users").where({ username: req.body.username });
    const userAlreadyExists = userQueryResult.length > 0
    if (userAlreadyExists) {
        res.status(400).send({ message: "Username already registered" });
        return;
    }

    let newUser = {};
    newUser['username'] = req.body.username;
    newUser['password'] = await bcrypt.hash(req.body.password, SALTROUNDS);

    const userId = await db("users").insert(newUser).returning("id");

    await deleteExistingTokens(userId);
    const token = await generateToken(userId);

    res.status(201).send({ token });
}

const generateToken = async (userId) => {
    const randomHalfToken = () => Math.random().toString(36).substring(2);
    const token = randomHalfToken() + randomHalfToken();

    const THREEHOURS = 3 * 60 * 60 * 1000;
    const FIVESECONDS = 5 * 1000;
    let expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + FIVESECONDS);

    await db("tokens").insert({ token, userId, expiryDate });
    return token;
}

const deleteExistingTokens = async (userId) => {
    await db("tokens").where({ userId }).delete();
}

router.get("/login", loginUser)
router.post("/register", registerUser)

module.exports =  { router, loginUser, registerUser };