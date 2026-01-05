
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    try {
        const conn = await createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await conn.execute('DESCRIBE Prediction');
        console.log('Prediction Table Schema:', rows);

        await conn.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSchema();
