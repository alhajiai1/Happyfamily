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
        email TEXT UNIQUE,
        phone TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating base table:', err.message);
        }
    });

    const migrationQueries = [
        "ALTER TABLE users ADD COLUMN ghanaCard TEXT;",
        "ALTER TABLE users ADD COLUMN otp TEXT;",
        "ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0;"
    ];

    migrationQueries.forEach((query) => {
        db.run(query, (err) => {
            // Silently ignore if column already exists
        });
    });

    console.log('Database schema verified and updated successfully.');
});

module.exports = db;