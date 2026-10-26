/**
 * CampusPay demo seed script
 * Put this file at: backend/src/seed.js
 * Run from the backend folder:  npm run seed
 *
 * It only deletes and recreates DEMO data (the 4 demo users below and the
 * groups/expenses/debts/transactions that belong to them). Real users are not touched.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Group = require("./models/Group");
const Expense = require("./models/Expense");
const Debt = require("./models/Debt");
const Transaction = require("./models/Transaction");

const DEMO_PASSWORD = "Demo@1234";

const DEMO_USERS = [
  { key: "demo", name: "Demo User", email: "demo@campuspay.com", balance: 5000 },
  { key: "riya", name: "Riya Sharma", email: "riya@campuspay.com", balance: 3000 },
  { key: "arjun", name: "Arjun Das", email: "arjun@campuspay.com", balance: 2500 },
  { key: "priya", name: "Priya Mondal", email: "priya@campuspay.com", balance: 1800 },
];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function cleanOldDemoData() {
  const old = await User.find({ email: { $in: DEMO_USERS.map((u) => u.email) } }).select("_id");
  const ids = old.map((u) => u._id);
  if (ids.length === 0) return;

  const groups = await Group.find({ members: { $in: ids } }).select("_id");
  const groupIds = groups.map((g) => g._id);

  await Expense.deleteMany({ group: { $in: groupIds } });
  await Debt.deleteMany({ group: { $in: groupIds } });
  await Group.deleteMany({ _id: { $in: groupIds } });
  await Transaction.deleteMany({ $or: [{ from: { $in: ids } }, { to: { $in: ids } }] });
  await User.deleteMany({ _id: { $in: ids } });
}

// equal split helper: every member owes amount / count
function equalSplits(memberIds, amount, approvedIds) {
  const each = Number((amount / memberIds.length).toFixed(2));
  return memberIds.map((id) => ({
    user: id,
    amount: each,
    approved: approvedIds.some((a) => a.equals(id)),
  }));
}

// same logic as approveExpense in expenseController: debtor -> payer, accumulate
async function createDebtsFromExpense(expense) {
  const payer = expense.paidBy.toString();
  for (const s of expense.splits) {
    const user = s.user.toString();
    if (user === payer || s.amount <= 0) continue;
    const existing = await Debt.findOne({ group: expense.group, from: user, to: payer });
    if (existing) {
      existing.amount = Number((existing.amount + s.amount).toFixed(2));
      await existing.save();
    } else {
      await Debt.create({ group: expense.group, from: user, to: payer, amount: s.amount });
    }
  }
}

async function addExpense({ group, paidBy, createdBy, amount, splits, status, createdAt, seenByCreator }) {
  const expense = await Expense.create({
    group: group._id,
    paidBy,
    createdBy,
    amount,
    splitBetween: group.members,
    splits,
    status,
    seenByCreator: seenByCreator || false,
    createdAt,
  });
  if (status === "approved") await createDebtsFromExpense(expense);
  return expense;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected ✅");

  await cleanOldDemoData();

  // ---------- Users ----------
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const u = {};
  for (const d of DEMO_USERS) {
    u[d.key] = await User.create({ name: d.name, email: d.email, password: hash, balance: d.balance });
  }
  const all4 = [u.demo._id, u.riya._id, u.arjun._id, u.priya._id];
  const all3 = [u.demo._id, u.riya._id, u.arjun._id];

  // ---------- Groups ----------
  const goa = await Group.create({ name: "Goa Trip 🌴", members: all4, createdBy: u.demo._id });
  const hostel = await Group.create({ name: "Hostel Room 204", members: all3, createdBy: u.riya._id });

  // ---------- Goa Trip expenses ----------
  // 1) Hotel ₹8000 paid by Demo, split equally, fully approved
  await addExpense({
    group: goa, paidBy: u.demo._id, createdBy: u.demo._id, amount: 8000,
    splits: equalSplits(all4, 8000, all4), status: "approved", createdAt: daysAgo(9),
  });

  // 2) Dinner ₹1200 paid by Riya, split equally, fully approved
  await addExpense({
    group: goa, paidBy: u.riya._id, createdBy: u.riya._id, amount: 1200,
    splits: equalSplits(all4, 1200, all4), status: "approved", createdAt: daysAgo(7),
  });

  // 3) Cab ₹1600 paid by Arjun, CUSTOM split, fully approved
  await addExpense({
    group: goa, paidBy: u.arjun._id, createdBy: u.arjun._id, amount: 1600,
    splits: [
      { user: u.demo._id, amount: 600, approved: true },
      { user: u.riya._id, amount: 400, approved: true },
      { user: u.arjun._id, amount: 400, approved: true },
      { user: u.priya._id, amount: 200, approved: true },
    ],
    status: "approved", createdAt: daysAgo(5),
  });

  // 4) Scuba diving ₹4000 paid by Priya, PENDING: Demo still has to approve (shows the approval flow)
  await addExpense({
    group: goa, paidBy: u.priya._id, createdBy: u.priya._id, amount: 4000,
    splits: equalSplits(all4, 4000, [u.priya._id, u.riya._id, u.arjun._id]),
    status: "pending", createdAt: daysAgo(1),
  });

  // 5) Party snacks ₹500 created by Demo and REJECTED by Riya (shows the rejection notification)
  await addExpense({
    group: goa, paidBy: u.demo._id, createdBy: u.demo._id, amount: 500,
    splits: equalSplits(all4, 500, [u.demo._id]),
    status: "rejected", seenByCreator: false, createdAt: daysAgo(3),
  });

  // ---------- Hostel expenses ----------
  // 6) Groceries ₹900 paid by Riya, fully approved
  await addExpense({
    group: hostel, paidBy: u.riya._id, createdBy: u.riya._id, amount: 900,
    splits: equalSplits(all3, 900, all3), status: "approved", createdAt: daysAgo(6),
  });

  // 7) Wi-Fi bill ₹600 paid by Demo, PENDING: waiting for Riya and Arjun
  await addExpense({
    group: hostel, paidBy: u.demo._id, createdBy: u.demo._id, amount: 600,
    splits: equalSplits(all3, 600, [u.demo._id]), status: "pending", createdAt: daysAgo(2),
  });

  // ---------- Wallet history ----------
  await Transaction.create([
    { from: u.demo._id, to: u.riya._id, amount: 500, createdAt: daysAgo(8) },
    { from: u.arjun._id, to: u.demo._id, amount: 300, createdAt: daysAgo(4) },
    { from: u.riya._id, to: u.priya._id, amount: 200, createdAt: daysAgo(2) },
  ]);

  console.log("\n✅ Demo data created");
  console.log("   Login:    demo@campuspay.com");
  console.log("   Password: " + DEMO_PASSWORD);
  console.log("   Others:   riya@ / arjun@ / priya@campuspay.com (same password)\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed ❌", err);
  process.exit(1);
});
