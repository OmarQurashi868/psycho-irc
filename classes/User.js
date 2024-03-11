const databaseConfig = require("../config/databaseConfig");
const knex = require('knex')(databaseConfig);

class User {
    #db = null;
    constructor(db) {
        this.db = db;
    }
    async find(username) {
        return await this.db.select().table("users").where({ username }).first();
    }
    async insert({ username, password }) {
        const idObj = await this.db("users").insert({ username, password }).returning("id");
        const id = idObj[0]["id"];
        return id;
    }
}

module.exports = new User(knex);