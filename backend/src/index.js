require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

app.use(express.json());
app.use(cors());

// ✅ ROUTES (ONLY ONCE EACH)
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/expense", expenseRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("CampusPay Backend Running 🚀");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});
