const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function check() {
    try {
        const tables = ['orders', 'order_items', 'order_pdfs', 'clients'];
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT count(*) FROM ${table}`);
                console.log(`Table ${table} exists, count: ${res.rows[0].count}`);
            } catch (e) {
                console.log(`Table ${table} does NOT exist or error: ${e.message}`);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

check();
