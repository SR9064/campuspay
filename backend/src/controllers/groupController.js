const Group = require("../models/Group");

/* ===== CREATE GROUP ===== */
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;

  try {
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Group name required" });
    }

    const invitees = (members || []).filter(
      (id) => id !== req.userId
    );

    const group = await Group.create({
      name: name.trim(),
      members: [req.userId], // creator joins immediately
      pendingMembers: [...new Set(invitees)], // everyone else is invited
      createdBy: req.userId
    });

    res.json({ group });
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== GET GROUPS (only groups I'm an active member of) ===== */
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId
    });

    res.json({ groups });
  } catch (err) {
    console.error("Get Groups Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== GET GROUP BY ID ===== */
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({
      members: group.members
    });

  } catch (err) {
    console.error("Group fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== GET MY PENDING INVITES ===== */
exports.getInvites = async (req, res) => {
  try {
    const groups = await Group.find({
      pendingMembers: req.userId
    }).populate("createdBy", "name");

    res.json({ invites: groups });
  } catch (err) {
    console.error("Get Invites Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== ACCEPT INVITE ===== */
exports.acceptInvite = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isPending = group.pendingMembers
      .map(id => id.toString())
      .includes(req.userId);

    if (!isPending) {
      return res.status(400).json({ error: "No pending invite for this group" });
    }

    group.pendingMembers = group.pendingMembers.filter(
      id => id.toString() !== req.userId
    );
    group.members.push(req.userId);

    await group.save();

    res.json({ message: "Joined group ✅" });
  } catch (err) {
    console.error("Accept Invite Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== DECLINE INVITE ===== */
exports.declineInvite = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    group.pendingMembers = group.pendingMembers.filter(
      id => id.toString() !== req.userId
    );

    if (!group.declinedBy.map(id => id.toString()).includes(req.userId)) {
      group.declinedBy.push(req.userId);
    }

    await group.save();

    res.json({ message: "Invite declined" });
  } catch (err) {
    console.error("Decline Invite Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== GET GROUPS WHERE SOMEONE DECLINED MY INVITE ===== */
exports.getDeclinedInvites = async (req, res) => {
  try {
    const groups = await Group.find({
      createdBy: req.userId,
      declinedBy: { $exists: true, $ne: [] }
    }).populate("declinedBy", "name");

    res.json({ declined: groups });
  } catch (err) {
    console.error("Get Declined Invites Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== DISMISS A DECLINED-INVITE NOTIFICATION ===== */
exports.dismissDeclined = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    group.declinedBy = group.declinedBy.filter(
      id => id.toString() !== userId
    );

    await group.save();

    res.json({ message: "Dismissed" });
  } catch (err) {
    console.error("Dismiss Declined Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===== LEAVE GROUP ===== */
exports.leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members
      .map(id => id.toString())
      .includes(userId);

    if (!isMember) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      id => id.toString() !== userId
    );

    await group.save();

    res.json({ message: "Left group ✅" });
  } catch (err) {
    console.error("Leave Group Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
