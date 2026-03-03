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
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));

        const ordersRes = await pool.query("SELECT id FROM orders LIMIT 1");
        console.log('Sample order ID:', ordersRes.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

check();
