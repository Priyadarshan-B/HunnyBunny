const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Load environment variables from .env file
dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    queueLimit: 0,
};

// Create a connection pool
let pool;

const createPool = async () => {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connection pool created successfully.');
    } catch (error) {
        console.error('Error creating database connection pool:', error);
        process.exit(1); // Exit process with failure
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection has been established successfully.');
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        await reconnect(); // Attempt to reconnect
    }
};

// Reconnection logic
const reconnect = async () => {
    console.log('Attempting to reconnect to the database...');
    await createPool();
    await testConnection();
};

// Initialize the database connection
(async () => {
    await createPool();
    await testConnection();
})();

module.exports = pool;