// models/PostMeta.model.js
const mongoose = require('mongoose');

const postMetaSchema = new mongoose.Schema({
    meta_id: { type: Number, required: true, unique: true },
    post_id: { type: Number, required: true },
    meta_key: { type: String },
    meta_value: { type: String }, // sab accept karega (string, obj, array)
}, { timestamps: true });

module.exports = mongoose.model('PostMeta', postMetaSchema);
