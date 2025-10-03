// migrateTermMeta.js

const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const TermMeta =require('./TermMeta.model')

async function migrate() {
  // 1. Connect MySQL
  const mysqlConn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "gims",
  });

  // 2. Connect Mongo
  await mongoose.connect("mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority");

  // 3. Fetch rows from MySQL
  const [rows] = await mysqlConn.execute(
    "SELECT meta_id, term_id, meta_key, meta_value FROM wpi6_termmeta"
  );

  // 4. Insert into Mongo
  await TermMeta.insertMany(rows);

  console.log(`✅ Migrated ${rows.length} rows from wpi6_termmeta`);

  // 5. Close connections
  await mysqlConn.end();
  await mongoose.disconnect();
}

migrate().catch(console.error);
