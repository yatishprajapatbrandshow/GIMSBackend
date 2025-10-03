// migrateTermTaxonomy.js

const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const TermTaxonomy =require('./TermTaxinomy.model')

async function migrate() {
  try {
    // 1. Connect to MySQL
    const mysqlConn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "gims",
    });
    console.log("✅ Connected to MySQL");

    // 2. Connect to MongoDB
    await mongoose.connect("mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority");
    console.log("✅ Connected to MongoDB");

    // 3. Fetch rows from MySQL
    const [rows] = await mysqlConn.execute(
      "SELECT term_taxonomy_id, term_id, taxonomy, description, parent, count FROM wpi6_term_taxonomy"
    );
    console.log(`📦 Fetched ${rows.length} rows from MySQL`);

    // 4. Insert into MongoDB
    if (rows.length > 0) {
      await TermTaxonomy.insertMany(rows);
      console.log("🚀 Migration completed successfully!");
    } else {
      console.log("⚠️ No rows found in zdkw_term_taxonomy table.");
    }

    // 5. Close connections
    await mysqlConn.end();
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}

migrate();
