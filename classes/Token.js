const databaseConfig = require("../config/databaseConfig");
const knex = require('knex')(databaseConfig);

class Token {
    #db = null;
    constructor(db) {
        this.db = db;
    }
    async find(token) {
        return await knex.select().table("tokens").where({ token }).first();
    }
    async insert({ token, userId, expiryDate }) {
        await this.db("tokens").insert({ token, userId, expiryDate });
    }
    async deleteAllForUser(userId) {
        await this.db("tokens").where({ userId }).delete();
    }
    async purgeExpiredTokens() {
        const currentTime = new Date();
        await knex("tokens").where('expiryDate', '<', currentTime).delete();
    }
}

module.exports = new Token(knex);