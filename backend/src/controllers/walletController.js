const User = require("../models/User");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

/* ===== ADD MONEY (TOP-UP) ===== */
exports.addMoney = async (req, res) => {
  const { amount } = req.body;

  try {
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.balance += numAmount;
    await user.save();

    // ✅ log as self-transaction (optional but useful)
    await Transaction.create({
      from: user._id,
      to: user._id,
      amount: numAmount
    });

    res.json({
      message: "Money added",
      balance: user.balance
    });

  } catch (err) {
    console.error("ADD MONEY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== GET BALANCE ===== */
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: user.balance });

  } catch (err) {
    console.error("BALANCE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== TRANSFER MONEY ===== */
exports.transfer = async (req, res) => {
  const { to, amount } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const numAmount = Number(amount);

    if (!to || !numAmount || numAmount <= 0) {
      throw new Error("Invalid input");
    }

    if (req.userId === to) {
      throw new Error("Cannot transfer to yourself");
    }

    const sender = await User.findById(req.userId).session(session);
    const receiver = await User.findById(to).session(session);

    if (!sender) throw new Error("Sender not found");
    if (!receiver) throw new Error("Receiver not found");

    if (sender.balance < numAmount) {
      throw new Error("Insufficient balance");
    }

    // 💸 transfer
    sender.balance -= numAmount;
    receiver.balance += numAmount;

    await sender.save({ session });
    await receiver.save({ session });

    // 🧾 log transaction
    await Transaction.create(
      [
        {
          from: sender._id,
          to: receiver._id,
          amount: numAmount
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Transfer successful",
      balance: sender.balance
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("TRANSFER ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

/* ===== TRANSACTION HISTORY ===== */
exports.getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { from: req.userId },
        { to: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("from", "name email")
      .populate("to", "name email");

    res.json({ transactions });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};