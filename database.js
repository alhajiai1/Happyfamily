const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE
    )`, (err) => {
        if (!err) {
            // Safely add missing columns if they don't exist yet
            db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN ghanaCard TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN otp TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0`, () => {});
            console.log('Database schema verified and updated successfully.');
        }
    });
});

module.exports = db;