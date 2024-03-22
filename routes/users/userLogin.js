const { z } = require("zod");
const { fromZodError } = require("zod-validation-error");
const bcrypt = require("bcrypt");
const User = require("../../classes/User");
const Token = require("../../classes/Token");
const { generateToken } = require("../../utils/userAuth");

const loginUserSchema = z.object({
    username: z.string(),
    password: z.string()
});

const loginUser = async (req, res) => {
    try {
        loginUserSchema.parse(req.body);
    } catch (err) {
        const validationError = fromZodError(err).toString();
        console.log(`Failed login from ${req.body.username}: ${validationError}`);
        res.status(400);
        res.send({ message: validationError });
        return
    }

    const userQueryResult = await User.find(req.body.username);
    const userNotExist = userQueryResult == undefined;
    if (userNotExist) {
        const message = "Username not found";
        console.log(`Failed login from ${req.body.username}: ${message}`);
        res.status(404);
        res.send({ message });
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        const message = "Password incorrect";
        console.log(`Failed login from ${req.body.username}: ${message}`);
        res.status(401);
        res.send({ message });
        return;
    }

    const userId = userQueryResult['id'];

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    console.log(`User logged in successfully: ${req.body.username}`);
    res.status(200);
    res.send({ token });
}

module.exports = loginUser;