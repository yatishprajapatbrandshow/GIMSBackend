// models/objectTerm.model.js
const mongoose = require("mongoose");

const objectTermSchema = new mongoose.Schema({
    object_id: {
        type: Number,
        required: true,
    },
    term_taxonomy_id: {
        type: Number,
        required: true,
    },
    term_order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true         // adds createdAt & updatedAt
});

module.exports = mongoose.model("TermRelationship", objectTermSchema);
