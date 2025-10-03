const mongoose = require("mongoose");

const termMetaSchema = new mongoose.Schema({
  meta_id: {
    type: Number,
    unique: true,
  },
  term_id: {
    type: Number
  },
  meta_key: {
    type: String,        // varchar(255)
  },
  meta_value: {
    type: String,        // longtext → String in Mongo
  },
});

module.exports = mongoose.model("TermMeta", termMetaSchema);
