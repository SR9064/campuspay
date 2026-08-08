import { useEffect, useState } from "react";
import API from "../api/api";

export default function AddExpense({
  refresh,
  reloadGroups,
  onGroupSelect
}: any) {
  const [amount, setAmount] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState("");
  const [customSplit, setCustomSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const myId = localStorage.getItem("userId");

  useEffect(() => {
    fetchGroups();
  }, [reloadGroups]);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/group");
      setGroups(res.data.groups || []);
    } catch (err) {
      console.log("Group fetch error", err);
    }
  };

  const fetchMembers = async (id: string) => {
    try {
      const res = await API.get(`/group/${id}`);
      setMembers(res.data.members || []);
      setSplitAmounts({});
      setPaidBy(myId || "");
    } catch (err) {
      console.log("Members fetch error", err);
    }
  };

  const updateSplit = (userId: string, value: string) => {
    setSplitAmounts((prev) => ({ ...prev, [userId]: value }));
  };

  const splitTotal = Object.values(splitAmounts).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  const handleAdd = async () => {
    try {
      if (!groupId) {
        alert("Select group ❌");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        alert("Enter valid amount ❌");
        return;
      }

      let payload: any = {
        groupId,
        amount: Number(amount),
        paidBy: paidBy || myId
      };

      if (customSplit) {
        if (Math.abs(splitTotal - Number(amount)) > 0.01) {
          alert(`Split amounts (₹${splitTotal.toFixed(2)}) must add up to the total (₹${Number(amount).toFixed(2)}) ❌`);
          return;
        }

        payload.splits = members.map((m) => ({
          user: m._id,
          amount: Number(splitAmounts[m._id] || 0)
        }));
      }

      setLoading(true);

      await API.post("/expense/add", payload);

      alert("Expense submitted — waiting for approval from everyone involved ✅");

      setAmount("");
      setSplitAmounts({});
      setCustomSplit(false);
      refresh?.();

    } catch (err: any) {
      console.log("Expense error 👉", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Add Expense</h2>
      <p className="text-sm text-gray-500 mb-3">
        This will need approval from everyone involved before it's finalized.
      </p>

      {/* 🟣 GROUP SELECT */}
      <select
        className="border p-2 w-full mb-3 rounded"
        value={groupId}
        onChange={(e) => {
          const id = e.target.value;
          setGroupId(id);
          onGroupSelect?.(id);
          fetchMembers(id);
        }}
      >
        <option value="">Select Group</option>
        {groups.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
      </select>

      {/* 🟡 WHO PAID */}
      {groupId && members.length > 0 && (
        <select
          className="border p-2 w-full mb-3 rounded"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m._id === myId ? `${m.name} (you)` : m.name}
            </option>
          ))}
        </select>
      )}

      {/* 💰 AMOUNT */}
      <input
        type="number"
        placeholder="Enter amount"
        className="border p-2 w-full mb-3 rounded"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* ⚖️ SPLIT TOGGLE */}
      {groupId && members.length > 0 && (
        <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={customSplit}
            onChange={(e) => setCustomSplit(e.target.checked)}
          />
          Split custom amounts (instead of equally)
        </label>
      )}

      {/* 🧮 CUSTOM SPLIT INPUTS */}
      {customSplit && members.length > 0 && (
        <div className="mb-3 border p-3 rounded bg-gray-50">
          {members.map((m) => (
            <div key={m._id} className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">{m.name}</span>
              <input
                type="number"
                placeholder="0"
                className="border p-1 w-24 rounded text-right"
                value={splitAmounts[m._id] || ""}
                onChange={(e) => updateSplit(m._id, e.target.value)}
              />
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-2">
            Total entered: ₹{splitTotal.toFixed(2)}
            {amount && ` / ₹${Number(amount).toFixed(2)}`}
          </div>
        </div>
      )}

      {/* ➕ BUTTON */}
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </div>
  );
}
