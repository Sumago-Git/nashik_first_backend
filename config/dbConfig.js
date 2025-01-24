// config/dbConfig.js
const mysql = require('mysql2');  // Import mysql2 package
require('dotenv').config();  // Load environment variables from .env

// Create MySQL connection pool
const dbObj = mysql.createPool({
  host: process.env.DB_HOST,  // Database host
  user: process.env.DB_USER,  // Database user
  password: process.env.DB_PASSWORD,  // Database password
  database: process.env.DB_NAME,  // Database name
  waitForConnections: true,  // Enable connection pooling
  connectionLimit: 10,  // Maximum number of connections
  queueLimit: 0  // No limit on the query queue
});

// Export the connection pool for use in other parts of the application
module.exports = dbObj.promise();
