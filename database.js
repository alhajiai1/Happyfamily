const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (creates database.sqlite in the root directory)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create the users table automatically if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            ghanaCard TEXT,
            otp TEXT,
            verified INTEGER DEFAULT 0
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Users table ready.');
            }
        });
    }
});

module.exports = db;