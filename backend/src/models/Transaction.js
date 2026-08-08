const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ ADD THIS LINE (VERY IMPORTANT)
module.exports = mongoose.model("Transaction", transactionSchema);
