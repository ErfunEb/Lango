const mongoose = require("mongoose");

const LanguageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  localName: {
    types: String,
    required: true
  }
});

// export model language with LanguageSchema
module.exports = mongoose.model("languages", LanguageSchema);