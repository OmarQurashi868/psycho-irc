const Token = require("../classes/Token");

const verifyToken = async (req, res, next) => {
    const token = req.get("authtoken");

    const isTokenValid = await checkTokenValidity(token);

    if (!isTokenValid) {
        res.status(401);
        res.send({ message: "authtoken is missing or invalid" });
        return;
    }

    next();
}

const checkTokenValidity = async (token) => {
    await Token.purgeExpiredTokens();

    const tokenMissing = token == undefined;
    if (tokenMissing) {
        return false;
    }

    const tokenData = await Token.find(token);
    const tokenInvalid = tokenData == undefined
    if (tokenInvalid) {
        return false;
    }

    return true;
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

module.exports = { verifyToken, checkTokenValidity, generateToken };