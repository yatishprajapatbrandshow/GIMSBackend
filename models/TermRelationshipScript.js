// migrateObjectTerm.js
const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const ObjectTerm = require("../models/TermTaxinomyRelationship.model"); // ✅ mongoose model

(async () => {
  try {
    // === 1. MySQL Connection ===
    const mysqlConn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root", // change if needed
      database: "gims", // your local DB
    });
    console.log("✅ Connected to MySQL");

    // === 2. MongoDB Connection ===
    await mongoose.connect(
      "mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ Connected to MongoDB");

    // === 3. Fetch data from MySQL ===
    const [rows] = await mysqlConn.execute(
      "SELECT * FROM wpi6_term_relationships"
    );
    console.log(`📦 Found ${rows.length} records in MySQL`);

    // === 4. Transform rows to docs ===
    const docs = rows.map((row) => ({
      object_id: row.object_id,
      term_taxonomy_id: row.term_taxonomy_id,
      term_order: row.term_order || 0,
    }));

    // === 5. Insert into MongoDB ===
    try {
      const result = await ObjectTerm.insertMany(docs, { ordered: false }); 
      // ordered:false → continues inserting even if duplicates
      console.log(`🎉 Successfully inserted ${result.length} records into MongoDB`);
    } catch (err) {
      if (err.writeErrors) {
        console.error(`⚠️ Some duplicates found. Inserted ${err.result.result.nInserted} records, skipped duplicates.`);
      } else {
        throw err;
      }
    }

    // === 6. Close connections ===
    await mysqlConn.end();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("🚨 Migration failed:", err);
    process.exit(1);
  }
})();
