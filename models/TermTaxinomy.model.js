const mongoose = require("mongoose");

const termTaxonomySchema = new mongoose.Schema({
  term_taxonomy_id: {
    type: Number,       // BIGINT
    required: true,
    unique: true,       // UN
  },
  term_id: {
    type: Number,       // BIGINT
    required: true,     // UN
  },
  taxonomy: {
    type: String,       // varchar(32)
    maxlength: 32,
  },
  description: {
    type: String,       // longtext
  },
  parent: {
    type: Number,       // BIGINT
  },
  count: {
    type: Number,       // BIGINT
  },
});

module.exports = mongoose.model("TermTaxonomy", termTaxonomySchema);
