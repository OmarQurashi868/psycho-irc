const { z } = require("zod");
const { fromZodError } = require("zod-validation-error");
const bcrypt = require("bcrypt");
const User = require("../../classes/User");
const Token = require("../../classes/Token");
const { generateToken } = require("../../utils/userAuth");

const SALTROUNDS = 10;
const registerUserSchema = z.object({
    username: z.string(),
    password: z.string().min(8, "Password must be 8 characters or longer"),
    passwordConfirmation: z.string()
})
    .refine(schema => schema.password == schema.passwordConfirmation, "Passwords do not match");


const registerUser = async (req, res) => {
    try {
        registerUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        console.log(currentdate.toLocaleString() +  `Failed registeration from ${req.body.username}: ${validationError}`);
        res.status(400);
        res.send({ message: validationError });
        return;
    }

    const userQueryResult = await User.find(req.body.username);
    const userAlreadyExists = userQueryResult != undefined;
    if (userAlreadyExists) {
        const message = "Username already registered";
        console.log(currentdate.toLocaleString() + " >" +  ` Failed registeration from ${req.body.username}: ${message}`);
        res.status(400);
        res.send({ message });
        return;
    }

    let newUser = {};
    newUser['username'] = req.body.username;
    newUser['password'] = await bcrypt.hash(req.body.password, SALTROUNDS);

    const userId = await User.insert(newUser);

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    console.log(currentdate.toLocaleString()+ " >" +` User registered successfully: ${req.body.username}`);
    res.status(201);
    res.send({ token });
}

module.exports = registerUser;