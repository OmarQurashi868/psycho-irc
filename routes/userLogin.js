const { z } = require("zod");
const { fromZodError } = require("zod-validation-error");
const bcrypt = require("bcrypt");
const User = require("../classes/User");
const Token = require("../classes/Token");
const { generateToken } = require("../utils/userAuth");

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
    const userNotExist = userQueryResult == undefined;
    if (userNotExist) {
        res.status(404);
        res.send({ message: "Username not found" });
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userPassword);
    if (!isPasswordCorrect) {
        res.status(403);
        res.send({ message: "Password incorrect" });
        return;
    }

    const userId = userQueryResult['id'];

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    res.status(200);
    res.send({ token });
}

module.exports = loginUser;