import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import knex from 'knex'

const SALTROUNDS = 10;
const router = express.Router();

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './database.db',
    },
    useNullAsDefault: true,
});

const userTableExists = await db.schema.hasTable("users")
if (!userTableExists)
    await db.schema.createTable("users", (table) => {
        table.increments("id");
        table.string("username");
        table.string("password");
    })

const tokenTableExists = await db.schema.hasTable("tokens")
if (!tokenTableExists)
    await db.schema.createTable("tokens", (table) => {
        table.increments("id");
        table.string("token");
        table.bigint("userId");
        table.dateTime("expiryDate");
    })


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

router.get("/login", async (req, res) => {
    try {
        loginUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400).send(validationError);
        return
    }

    const userQueryResult = await db.select().table("users").where({ username: req.body.username }).first();
    if (userQueryResult.length < 1) {
        res.status(400).send("Username not found");
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        res.status(400).send("Password incorrect");
        return;
    }

    const userId = userQueryResult['id']
    const token = await generateToken(userId);

    res.status(200).send({ token });
})

router.post("/register", async (req, res) => {
    try {
        registerUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400).send(validationError);
        return;
    }

    const userQueryResult = await db.select().table("users").where({ username: req.body.username });
    if (userQueryResult.length > 0) {
        res.status(400).send("Username already registered");
        return;
    }

    let newUser = {};
    newUser['username'] = req.body.username;
    newUser['password'] = await bcrypt.hash(req.body.password, SALTROUNDS);

    const userId = await db("users").insert(newUser).returning("id");

    const token = await generateToken(userId);

    res.status(201).send({ token });
})

const generateToken = async (userId) => {
    const randomHalfToken = () => Math.random().toString(36).substring(2);
    const token = randomHalfToken() + randomHalfToken();

    const THREEHOURS = 3 * 60 * 60 * 1000;
    let expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + THREEHOURS);

    await db("tokens").insert({ token, userId, expiryDate });
    return token;
}

export default router;