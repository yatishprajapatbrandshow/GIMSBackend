// cleanSlugPath.js Remove / From All path in slug Model
const mongoose = require("mongoose");
const Slug = require("../models/slug.model"); // ✅ your Slug mongoose model

(async () => {
  try {
    // === 1. MongoDB Connection ===
    await mongoose.connect(
      "mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ Connected to MongoDB");

    // === 2. Find slugs with trailing "/" ===
    const slugs = await Slug.find({ path: /\/$/ }); // regex → ends with /

    console.log(`📦 Found ${slugs.length} slugs with trailing "/"`);

    // === 3. Update each slug ===
    let updatedCount = 0;
    for (const slug of slugs) {
      const newPath = slug.path.replace(/\/+$/, ""); // remove all trailing slashes
      if (newPath !== slug.path) {
        slug.path = newPath;
        await slug.save();
        updatedCount++;
        console.log(`🔄 Updated: ${slug._id} → ${newPath}`);
      }
    }

    console.log(`🎉 Cleanup complete. Updated ${updatedCount} slugs.`);

    // === 4. Close connection ===
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("🚨 Cleanup failed:", err);
    process.exit(1);
  }
})();
