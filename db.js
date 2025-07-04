const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Change if needed
    password: 'SRIMANTA@2005',      // Change if needed
    database: 'Hotel',
    PORT: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = connection;
