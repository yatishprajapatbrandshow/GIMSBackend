const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const Term =require("./Term.model")

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

  // 3. Get rows from MySQL
  const [rows] = await mysqlConn.execute("SELECT term_id, name, slug, term_group FROM wpi6_terms");

  // 4. Insert into Mongo
  await Term.insertMany(rows);

  console.log("✅ Migration done!");

  // 5. Close connections
  await mysqlConn.end();
  await mongoose.disconnect();
}

migrate().catch(console.error);
