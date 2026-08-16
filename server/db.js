const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway")
        ? { rejectUnauthorized: false }
        : false,
});

async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            event_date DATE,
            photo BYTEA,
            photo_mimetype TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS results (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            result_date DATE,
            photo BYTEA,
            photo_mimetype TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);
}

module.exports = { pool, initSchema };
