const databaseConfig = require('../config/databaseConfig');
const knex = require('knex')(databaseConfig);

const initTables = async () => {
    const userTableExists = await knex.schema.hasTable("users")
    if (!userTableExists)
        await knex.schema.createTable("users", (table) => {
            table.increments("id");
            table.string("username");
            table.string("password");
        })

    const tokenTableExists = await knex.schema.hasTable("tokens")
    if (!tokenTableExists)
        await knex.schema.createTable("tokens", (table) => {
            table.increments("id");
            table.string("token");
            table.bigint("userId");
            table.dateTime("expiryDate");
        })
}

module.exports = initTables