const Token = require("../classes/Token");

const verifyToken = async (req, res, next) => {
    await Token.purgeExpiredTokens();

    const token = req.get("authToken")
    const tokenMissing = token == undefined;
    if (tokenMissing) {
        res.status(400);
        res.send({ message: "Token is missing" });
        return false;
    }

    const tokenData = await Token.find(token);
    const tokenInvalid = tokenData == undefined
    if (tokenInvalid) {
        res.status(401);
        res.send({ message: "Token is invalid" });
        return false;
    }

    next();
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

module.exports = { verifyToken, generateToken };