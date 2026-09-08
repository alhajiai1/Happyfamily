const sqlite3 = require('sqlite3').verbose();

// This creates or opens a local database file named store.db
const db = new sqlite3.Database('./store.db', (err) => {
  if (err) {
    console.error('Database opening error: ', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  // Table to store your phone accessories and items
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
  )`);

  // Table to track customer orders and payment references
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    buyer_phone TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table for verification codes if needed later
  db.run(`CREATE TABLE IF NOT EXISTS verifications (
    phone TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    verified INTEGER DEFAULT 0
  )`);
});

module.exports = db;