const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create table synchronously right away
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        ghanaCard TEXT,
        otp TEXT,
        verified INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready and verified.');
        }
    });
});

module.exports = db;