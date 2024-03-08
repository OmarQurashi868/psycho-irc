import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import knex from 'knex'
const myknex = knex({
    client: 'sqlite3',
    connection: {
        filename: './database.db',
    },
    useNullAsDefault: true,
});

const SALTROUNDS = 10;
const router = express.Router();

const tableExists = await myknex.schema.hasTable("users")
if (!tableExists)
    await myknex.schema.createTable("users", (table) => {
        table.increments("id");
        table.string("username");
        table.string("password");
    })


const registerUserSchema = z.object({
    username: z.string(),
    password: z.string(),
    passwordConfirmation: z.string()
});
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
    }

    const userQueryResult = await myknex.select().table("users").where({ username: req.body.username });
    if (userQueryResult.length < 1) {
        res.status(400).send("Username not found");
        return;
    }

    const userPassword = userQueryResult[0]['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        res.status(400).send("Password incorrect");
        return;
    }

    res.status(200).send();
})

router.post("/register", async (req, res) => {
    try {
        registerUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        res.status(400).send(validationError);
    }

    const userQueryResult = await myknex.select().table("users").where({ username: req.body.username });
    if (userQueryResult.length > 0) {
        res.status(400).send("Username already registered");
        return;
    }

    let newUser = {};
    newUser['username'] = req.body.username;
    newUser['password'] = await bcrypt.hash(req.body.password, SALTROUNDS);

    // TODO: Save data to db
    await myknex("users").insert(newUser);

    res.status(201).send(newUser);
})

export default router;