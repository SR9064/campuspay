import { useEffect, useState } from "react";
import API from "../api/api";

export default function WalletHistory() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await API.get("/wallet/history");
    setData(res.data.transactions);
  };

  const myId = localStorage.getItem("userId");

  const filtered = data.filter((t) => {
    if (filter === "sent") return t.from._id === myId;
    if (filter === "received") return t.to._id === myId;
    return true;
  });

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="font-bold mb-3">Transaction History</h2>
      <select
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3 border p-1"
      >
        <option value="all">All</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
      </select>
      {filtered.map((t: any) => (
        <div key={t._id} className="border-b py-2 text-sm">
          {t.from.name} → {t.to.name} ₹{t.amount}
        </div>
      ))}
    </div>
  );
}
