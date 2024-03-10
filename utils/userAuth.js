const Token = require("../classes/token");

const verifyToken = async (req, res, next) => {
    await Token.purgeExpiredTokens();

    const tokenMissing = req.body['token'] == undefined;
    if (tokenMissing) {
        res.status(403);
        res.send({ message: "Token is missing" });
        return;
    }

    const token = req.body['token']
    const tokenData = Token.find(token);
    const tokenInvalid = tokenData == undefined
    if (tokenInvalid) {
        res.status(403);
        res.send({ message: "Token is invalid" });
        return;
    }

    next();
}

module.exports = verifyToken;