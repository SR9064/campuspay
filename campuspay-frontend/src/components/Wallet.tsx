import { useEffect, useState } from "react";
import API from "../api/api";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    fetchBalance();
    fetchUser();
    fetchUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/user/me");
      setName(res.data.name);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/user");
      const myId = localStorage.getItem("userId");
      const others = (res.data.users || []).filter(
        (u: any) => u._id !== myId
      );
      setUsers(others);
    } catch (err) {
      console.log("User fetch error", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await API.get("/wallet/balance");
      setBalance(res.data.balance);
    } catch (err) {
      console.log(err);
    }
  };

  const addMoney = async () => {
    if (!amount || Number(amount) <= 0) return;

    try {
      await API.post("/wallet/add-money", {
        amount: Number(amount),
      });

      setAmount("");
      fetchBalance();
    } catch (err) {
      console.log(err);
    }
  };

  const sendMoney = async () => {
    setTransferError("");

    if (!transferTo) {
      setTransferError("Select someone to send money to ❌");
      return;
    }

    if (!transferAmount || Number(transferAmount) <= 0) {
      setTransferError("Enter a valid amount ❌");
      return;
    }

    if (Number(transferAmount) > balance) {
      setTransferError("Insufficient balance ❌");
      return;
    }

    try {
      setTransferLoading(true);

      await API.post("/wallet/transfer", {
        to: transferTo,
        amount: Number(transferAmount),
      });

      setTransferTo("");
      setTransferAmount("");
      fetchBalance();

    } catch (err: any) {
      console.log("Transfer error", err.response?.data || err.message);
      setTransferError(err.response?.data?.error || "Transfer failed ❌");
    } finally {
      setTransferLoading(false);
    }
  };

  const inputClass =
    "border-0 bg-white/10 backdrop-blur p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:opacity-50";

  return (
    <div className="space-y-6">

      {/* 💰 BALANCE + ADD MONEY */}
      <div className="glass glass-accent card-animate p-8">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          Wallet ({name || "Loading..."})
        </h2>

        <p className="text-4xl font-bold mb-6 text-emerald-400">
          ₹ {balance}
        </p>

        <input
          type="number"
          placeholder="Add money"
          className={inputClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={addMoney}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-white py-3 rounded-xl transition font-semibold shadow-lg"
        >
          Add Money
        </button>
      </div>

      {/* 💸 SEND MONEY */}
      <div className="glass card-animate p-8">
        <h2 className="text-lg font-semibold mb-4">Send Money</h2>

        {transferError && (
          <div className="bg-red-500/15 border border-red-400/30 text-red-300 p-3 mb-4 rounded-xl text-sm">
            {transferError}
          </div>
        )}

        <select
          className={inputClass + " text-gray-800"}
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
        >
          <option value="">Send to...</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          className={inputClass}
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />

        <button
          onClick={sendMoney}
          disabled={transferLoading}
          className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition ${
            transferLoading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90"
          }`}
        >
          {transferLoading ? "Sending..." : "Send Money"}
        </button>
      </div>

    </div>
  );
}
