const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create products table with an image column
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    stock INTEGER,
    image TEXT
  )`);

  // Clear existing old items if any
  db.run(`DELETE FROM products`);

  const stmt = db.prepare(`INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)`);

  // Insert items with actual product images
  stmt.run("Tecno Spark Screen Protector", 35, 15, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400");
  stmt.run("Silicone Phone Case", 50, 20, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400");
  stmt.run("Fast Charging Type-C Cable", 45, 10, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400");

  stmt.finalize();
  console.log("Database seeded successfully with images!");
});

db.close();