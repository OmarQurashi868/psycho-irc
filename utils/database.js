const knex = require('knex');
const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './database.db',
    },
    useNullAsDefault: true,
});

const initTables = async () => {
    const userTableExists = await db.schema.hasTable("users")
    if (!userTableExists)
        await db.schema.createTable("users", (table) => {
            table.increments("id");
            table.string("username");
            table.string("password");
        })

    const tokenTableExists = await db.schema.hasTable("tokens")
    if (!tokenTableExists)
        await db.schema.createTable("tokens", (table) => {
            table.increments("id");
            table.string("token");
            table.bigint("userId");
            table.dateTime("expiryDate");
        })
}

module.exports = initTables