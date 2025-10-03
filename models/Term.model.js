const mongoose = require("mongoose");

const termSchema = new mongoose.Schema({
    term_id: {
        type: Number, // BIGINT
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    term_group: {
        type: Number, // BIGINT
    },
});

// Auto-increment simulation for term_id if needed
// Mongoose does not have autoIncrement by default like SQL
// You'd typically use a plugin like mongoose-sequence or manually handle counters.

module.exports = mongoose.model("Term", termSchema);
