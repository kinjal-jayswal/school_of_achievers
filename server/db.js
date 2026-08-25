const { Pool, types } = require("pg");

// pg's default DATE parser builds a local-midnight JS Date, which shifts to
// the previous day once serialized to UTC (res.json -> toISOString) whenever
// the server's local timezone is behind UTC. Return the raw 'YYYY-MM-DD'
// string instead so no timezone conversion ever happens.
types.setTypeParser(1082, (val) => val);

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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS enquiries (
            id SERIAL PRIMARY KEY,
            parent_name TEXT NOT NULL,
            email TEXT,
            phone TEXT NOT NULL,
            campus TEXT NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);

    // School Diary support: classify events (holiday/vacation/celebration) and
    // allow a date range for multi-day spans like vacations.
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'celebration';`);
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;`);
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS campus TEXT DEFAULT 'both';`);
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;`);
}

module.exports = { pool, initSchema };
