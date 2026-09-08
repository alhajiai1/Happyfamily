const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Creates a local database file named marketplace.db automatically
const dbPath = path.resolve(__dirname, 'marketplace.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Automatically create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      seller_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(seller_phone) REFERENCES users(phone_number)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_phone TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      product_id INTEGER,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);
});

// Helper function to match pool.query style
module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert Postgres $1, $2 placeholders to SQLite ? placeholders
      const sqliteText = text.replace(/\$\d+/g, '?');
      
      if (text.trim().toLowerCase().startsWith('select')) {
        db.all(sqliteText, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(sqliteText, params, function (err) {
          if (err) reject(err);
          else resolve({ rows: [], insertId: this.lastID });
        });
      }
    });
  },
};