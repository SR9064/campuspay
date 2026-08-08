import { useEffect, useState } from "react";
import API from "../api/api";

export default function PendingExpenses({ onResponded }: any) {
  const [pending, setPending] = useState<any[]>([]);
  const myId = localStorage.getItem("userId");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await API.get("/expense/pending");
      setPending(res.data.pending || []);
    } catch (err) {
      console.log("Pending fetch error", err);
      setPending([]);
    }
  };

  const respond = async (expenseId: string, action: "approve" | "reject") => {
    try {
      await API.post(`/expense/${action}/${expenseId}`);
      fetchPending();
      onResponded?.();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed ❌");
    }
  };

  if (pending.length === 0) return null;

  return (
    <div className="glass card-animate p-4 mb-4">
      <h2 className="font-bold mb-3">⏳ Pending Expense Approvals</h2>

      {pending.map((exp: any) => {
        const mySplit = exp.splits.find((s: any) => s.user?._id === myId);

        return (
          <div key={exp._id} className="border-b py-3 last:border-none">
            <p className="font-medium text-gray-700">
              {exp.group?.name} — ₹{exp.amount}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Paid by {exp.paidBy?.name}, added by {exp.createdBy?.name}
            </p>
            <p className="tex">
              Your share: ₹{mySplit?.amount ?? 0}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => respond(exp._id, "approve")}
                className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => respond(exp._id, "reject")}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
