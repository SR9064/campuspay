const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: Number,
  splitBetween: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  splits: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      amount: Number,
      approved: {
        type: Boolean,
        default: false
      }
    }
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  seenByCreator: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Expense", expenseSchema);
