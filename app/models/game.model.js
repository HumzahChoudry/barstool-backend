const mongoose = require("mongoose");

const GameSchema = mongoose.Schema(
  {
    _id: String
  },
  {
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.model("Game", GameSchema);
