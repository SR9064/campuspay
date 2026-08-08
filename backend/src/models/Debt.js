const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Debt", debtSchema);