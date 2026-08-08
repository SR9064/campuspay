import { useEffect, useState } from "react";
import API from "../api/api";

export default function ExpenseHistory({ groupId }: any) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      return;
    }

    fetchHistory();
  }, [groupId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/expense/history/${groupId}`);
      setExpenses(res.data?.expenses || []);

    } catch (err: any) {
      console.log(
        "Expense history error 👉",
        err.response?.data || err.message
      );
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) return null;

  if (loading) {
    return (
      <div className="glass card-animate p-6">
        Loading history...
      </div>
    );
  }

  return (
    <div className="glass card-animate p-6">
      <h2 className="font-semibold mb-4">Expense History</h2>

      {expenses.length === 0 ? (
        <p className="text-gray-600">No expenses yet</p>
      ) : (
        expenses.map((e: any) => (
          <div
            key={e._id}
            className="border-b border-white/20 py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">
                {e.paidBy?.name || "Unknown"}
              </p>
              <p className="text-gray-600 text-sm">
                {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>

            <p className="font-semibold text-gray-800">
              ₹ {e.amount || 0}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
