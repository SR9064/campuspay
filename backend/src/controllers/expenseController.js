const Expense = require("../models/Expense");
const Debt = require("../models/Debt");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Group = require("../models/Group");

/* ================= ADD EXPENSE (PENDING APPROVAL) ================= */
exports.addExpense = async (req, res) => {
  const { groupId, amount, paidBy, splits } = req.body;

  try {
    if (!groupId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const members = group.members.map(m => m.toString());
    const creator = req.userId;

    if (!members.includes(creator.toString())) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }

    // Who paid — defaults to whoever is submitting, but can name someone else (requires their approval)
    const payer = paidBy || creator;

    if (!members.includes(payer.toString())) {
      return res.status(400).json({ error: "Payer must be a group member" });
    }

    let finalSplits;

    if (splits && Array.isArray(splits) && splits.length > 0) {
      const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      if (Math.abs(splitTotal - Number(amount)) > 0.01) {
        return res.status(400).json({
          error: `Split amounts (₹${splitTotal.toFixed(2)}) must add up to the total (₹${Number(amount).toFixed(2)})`
        });
      }

      const splitUserIds = splits.map(s => s.user.toString());
      const invalidUser = splitUserIds.find(id => !members.includes(id));
      if (invalidUser) {
        return res.status(400).json({ error: "Split includes someone not in this group" });
      }

      finalSplits = splits.map(s => ({
        user: s.user,
        amount: Number(s.amount),
        approved: s.user.toString() === creator.toString() // creator auto-approves their own share
      }));
    } else {
      const perPerson = Number((amount / members.length).toFixed(2));
      finalSplits = members.map(m => ({
        user: m,
        amount: perPerson,
        approved: m === creator.toString()
      }));
    }

    // If payer isn't the creator, payer must also approve (they're claiming they paid)
    const payerAlreadyInSplits = finalSplits.some(s => s.user.toString() === payer.toString());
    if (!payerAlreadyInSplits && payer.toString() !== creator.toString()) {
      finalSplits.push({ user: payer, amount: 0, approved: false });
    }

    const expense = await Expense.create({
      group: groupId,
      paidBy: payer,
      createdBy: creator,
      amount,
      splitBetween: members,
      splits: finalSplits,
      status: "pending"
    });

    res.json({ message: "Expense submitted — waiting for approval ✅", expense });

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET MY PENDING EXPENSE APPROVALS ================= */
exports.getPendingExpenses = async (req, res) => {
  try {
    const userId = req.userId;

    const expenses = await Expense.find({
      status: "pending",
      splits: {
        $elemMatch: {
          user: userId,
          approved: false
        }
      }
    })
      .populate("paidBy", "name")
      .populate("createdBy", "name")
      .populate("group", "name")
      .populate("splits.user", "name");

    res.json({ pending: expenses });
  } catch (err) {
    console.error("GET PENDING EXPENSES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= APPROVE EXPENSE SPLIT ================= */
exports.approveExpense = async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.userId;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const split = expense.splits.find(s => s.user.toString() === userId);

    if (!split) {
      return res.status(400).json({ error: "You are not part of this expense" });
    }

    split.approved = true;

    const allApproved = expense.splits.every(s => s.approved);

    if (allApproved) {
      expense.status = "approved";

      const payer = expense.paidBy.toString();

      for (let split of expense.splits) {
        const user = split.user.toString();
        if (user === payer || split.amount <= 0) continue;

        let existingDebt = await Debt.findOne({
          group: expense.group,
          from: user,
          to: payer
        });

        if (existingDebt) {
          existingDebt.amount = Number((existingDebt.amount + split.amount).toFixed(2));
          await existingDebt.save();
        } else {
          await Debt.create({
            group: expense.group,
            from: user,
            to: payer,
            amount: split.amount
          });
        }
      }
    }

    await expense.save();

    res.json({ message: allApproved ? "Expense fully approved ✅" : "Approved — waiting on others" });
  } catch (err) {
    console.error("APPROVE EXPENSE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= REJECT EXPENSE SPLIT ================= */
exports.rejectExpense = async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.userId;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const isPart = expense.splits.some(s => s.user.toString() === userId);

    if (!isPart) {
      return res.status(400).json({ error: "You are not part of this expense" });
    }

    expense.status = "rejected";
    await expense.save();

    res.json({ message: "Expense rejected ❌ — no debt created" });
  } catch (err) {
    console.error("REJECT EXPENSE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
/* ================= GET MY REJECTED EXPENSE NOTIFICATIONS ================= */
exports.getRejectedExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      status: "rejected",
      createdBy: req.userId,
      seenByCreator: false
    })
      .populate("group", "name")
      .populate("splits.user", "name");

    res.json({ rejected: expenses });
  } catch (err) {
    console.error("GET REJECTED EXPENSES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= DISMISS A REJECTED EXPENSE NOTIFICATION ================= */
exports.dismissRejected = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    expense.seenByCreator = true;
    await expense.save();

    res.json({ message: "Dismissed" });
  } catch (err) {
    console.error("DISMISS REJECTED ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GLOBAL DASHBOARD ================= */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ ONLY USER GROUPS
    const groups = await Group.find({ members: userId });
    const groupIds = groups.map(g => g._id);

    const debts = await Debt.find({
      group: { $in: groupIds },
      $or: [{ from: userId }, { to: userId }]
    })
      .populate("from", "name")
      .populate("to", "name");

    let youOwe = 0;
    let youAreOwed = 0;
    const map = {};

    for (let d of debts) {
      if (!d.from || !d.to) continue;

      const from = d.from._id.toString();
      const to = d.to._id.toString();

      if (from === userId) {
        youOwe += d.amount;

        if (!map[to]) map[to] = { user: d.to, net: 0 };
        map[to].net -= d.amount;
      }

      if (to === userId) {
        youAreOwed += d.amount;

        if (!map[from]) map[from] = { user: d.from, net: 0 };
        map[from].net += d.amount;
      }
    }

    res.json({
      youOwe: Number(youOwe.toFixed(2)),
      youAreOwed: Number(youAreOwed.toFixed(2)),
      breakdown: Object.values(map)
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GROUP DASHBOARD ================= */
exports.getGroupDashboard = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId).populate("members", "name");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const users = group.members.map(u => u._id.toString());

    const debts = await Debt.find({
      group: groupId,
      from: { $in: users },
      to: { $in: users }
    })
      .populate("from", "name")
      .populate("to", "name");

    const balanceMap = {};

    for (let d of debts) {
      const from = d.from._id.toString();
      const to = d.to._id.toString();

      balanceMap[from] = (balanceMap[from] || 0) - d.amount;
      balanceMap[to] = (balanceMap[to] || 0) + d.amount;
    }

    const members = group.members.map(u => ({
      user: u,
      net: Number((balanceMap[u._id] || 0).toFixed(2))
    }));

    let youOwe = 0, youAreOwed = 0;

    members.forEach(m => {
      if (m.user._id.toString() === userId) {
        if (m.net < 0) youOwe = Math.abs(m.net);
        if (m.net > 0) youAreOwed = m.net;
      }
    });

    res.json({
      groupId,
      groupName: group.name, // ✅ FIXED
      youOwe,
      youAreOwed,
      members
    });

  } catch (err) {
    console.error("GROUP DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GROUP SETTLEMENT ================= */
exports.getGroupSettlement = async (req, res) => {
  const { groupId } = req.params;

  try {
    const debts = await Debt.find({ group: groupId })
      .populate("from", "name")
      .populate("to", "name");

    const settlements = simplifyDebts(debts);

    res.json({ settlements });

  } catch (err) {
    console.error("SETTLEMENT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GROUP EXPENSES ================= */
exports.getGroupExpenses = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ group: groupId, status: "approved" })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= SETTLE UP ================= */
exports.settleUp = async (req, res) => {
  const { toUserId, amount, groupId } = req.body;
  const userId = req.userId;

  try {
    const numAmount = Number(amount);

    if (!toUserId || !numAmount || numAmount <= 0 || !groupId) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Only ever settle a debt where YOU are the one who owes
    const debt = await Debt.findOne({
      group: groupId,
      from: userId,
      to: toUserId
    });

    if (!debt) {
      return res.status(400).json({ error: "No debt found where you owe this amount" });
    }

    if (numAmount > debt.amount + 0.01) {
      return res.status(400).json({ error: "Amount exceeds what you owe" });
    }

    const payer = await User.findById(userId);
    const receiver = await User.findById(toUserId);

    if (!payer || !receiver) {
      return res.status(400).json({ error: "User not found" });
    }

    if (payer.balance < numAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update wallet
    payer.balance -= numAmount;
    receiver.balance += numAmount;

    await payer.save();
    await receiver.save();

    // Update debt
    if (numAmount >= debt.amount - 0.01) {
      await debt.deleteOne();
    } else {
      debt.amount = Number((debt.amount - numAmount).toFixed(2));
      await debt.save();
    }

    // Save transaction
    await Transaction.create({
      from: payer._id,
      to: receiver._id,
      amount: numAmount
    });

    res.json({ message: "Settlement successful ✅" });

  } catch (err) {
    console.error("SETTLE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
/* ================= SIMPLIFY DEBTS ================= */
const simplifyDebts = (debts) => {
  const balance = {};
  const userMap = {};

  for (let d of debts) {
    const from = d.from._id.toString();
    const to = d.to._id.toString();

    userMap[from] = d.from;
    userMap[to] = d.to;

    balance[from] = (balance[from] || 0) - d.amount;
    balance[to] = (balance[to] || 0) + d.amount;
  }

  const creditors = [];
  const debtors = [];

  for (let u in balance) {
    if (balance[u] > 0) creditors.push({ user: u, amount: balance[u] });
    if (balance[u] < 0) debtors.push({ user: u, amount: -balance[u] });
  }

  const result = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].amount, creditors[j].amount);

    result.push({
      from: userMap[debtors[i].user],
      to: userMap[creditors[j].user],
      amount: Number(amt.toFixed(2))
    });

    debtors[i].amount -= amt;
    creditors[j].amount -= amt;

    if (debtorDone(debtors[i])) i++;
    if (creditorDone(creditors[j])) j++;
  }

  return result;
};

const debtorDone = (d) => d.amount <= 0.01;
const creditorDone = (c) => c.amount <= 0.01;
