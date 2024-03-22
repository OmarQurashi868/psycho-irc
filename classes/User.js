const databaseConfig = require("../config/databaseConfig");
const knex = require('knex')(databaseConfig);

class User {
    #db = null;
    constructor(db) {
        this.db = db;
    }
    async find(username) {
        return await this.db("users").select().where({ username }).first();
    }
    async insert({ username, password }) {
        const idObj = await this.db("users").insert({ username, password }).returning("id");
        const id = idObj[0]["id"];
        return id;
    }
    async getUsernameByToken(token) {
        const userIdObj = await this.db("tokens").select("userId").where({ token }).first();
        const userNameObj = await this.db("users").select("username").where({ id: userIdObj["userId"] }).first();
        const username = userNameObj["username"];
        return username;
    }
}

module.exports = new User(knex);