// migratePostMeta.js
const mysql = require("mysql2/promise");
const mongoose = require("mongoose");

// === 1. MongoDB Connection ===
const PostMeta = require("../models/postMeta.model");
const mongoURL =
    "mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority";

// === 2. MySQL Connection Config ===
const mysqlConfig = {
    host: "localhost",   // change if not localhost
    user: "root",        // your mysql username
    password: "root", // your mysql password
    database: "gims", // replace with your db
};

(async () => {
    try {
        // Connect MongoDB
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB Atlas");

        // Connect MySQL
        const mysqlConn = await mysql.createConnection(mysqlConfig);
        console.log("✅ Connected to MySQL");

        // Fetch MySQL Data
        const [rows] = await mysqlConn.execute(
            "SELECT meta_id, post_id, meta_key, meta_value FROM wpi6_postmeta"
        );

        console.log(`📦 Found ${rows.length} rows in MySQL`);

        // Prepare documents for MongoDB
        const documents = rows.map(row => ({
            meta_id: row.meta_id,
            post_id: row.post_id,
            meta_key: row.meta_key,
            meta_value: row.meta_value,
        }));

        // Insert all at once (ignores duplicates if already exist)
        await PostMeta.insertMany(documents, { ordered: false })
            .then(() => console.log("🎉 Migration completed successfully!"))
            .catch(err => console.error("⚠️ Some inserts failed (possible duplicates):", err));

        // Close connections
        await mysqlConn.end();
        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration error:", err);
    }
})();
