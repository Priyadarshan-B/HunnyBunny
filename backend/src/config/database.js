const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    queueLimit: 0,
};

let poolPromise;

const createPoolAndTest = async () => {
    try {
        const pool = mysql.createPool(dbConfig);
        console.log('Database connection pool created successfully.');
        const connection = await pool.getConnection();
        console.log('Database connection has been established successfully.');
        connection.release();
        return pool;
    } catch (error) {
        console.error('Error creating or testing database connection pool:', error);
        process.exit(1);
    }
};

poolPromise = createPoolAndTest();

module.exports = poolPromise;