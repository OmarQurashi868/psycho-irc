const databaseConfig = require("../config/databaseConfig");
const knex = require('knex')(databaseConfig);

class Token {
    #db = null;
    constructor(db) {
        this.db = db;
    }
    async insert({ token, userId, expiryDate }) {
        await this.db("tokens").insert({ token, userId, expiryDate });
    }
    async deleteAllForUser(userId) {
        await this.db("tokens").where({ userId }).delete();
    }
}

module.exports = new Token(knex);