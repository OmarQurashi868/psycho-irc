const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './database.db',
    },
    useNullAsDefault: true,
});

const verifyToken = async (req, res, next) => {
    await purgeExpiredTokens();

    const tokenMissing = req.body['token'] == null;
    if (tokenMissing) {
        res.status(403).send({ message: "Token is missing" });
        return;
    }

    const token = req.body['token']
    const tokenData = knex.select().table("tokens").where({ token }).first();
    const tokenInvalid = tokenData == null
    if (tokenInvalid) {
        res.status(403).send({ message: "Token is invalid" });
        return;
    }

    next();
}

const purgeExpiredTokens = async () => {
    const currentTime = new Date();
    knex("tokens").where('expiryDate', '<', currentTime).delete();
}

module.exports = verifyToken;