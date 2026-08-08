import { useEffect, useState } from "react";
import API from "../api/api";

export default function Notifications() {
  const [declined, setDeclined] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [declinedRes, rejectedRes] = await Promise.all([
        API.get("/group/declined-notifications"),
        API.get("/expense/rejected-notifications")
      ]);
      setDeclined(declinedRes.data.declined || []);
      setRejected(rejectedRes.data.rejected || []);
    } catch (err) {
      console.log("Notifications fetch error", err);
    }
  };

  const dismissDeclined = async (groupId: string, userId: string) => {
    try {
      await API.post(`/group/declined/${groupId}/${userId}/dismiss`);
      fetchAll();
    } catch (err) {
      console.log(err);
    }
  };

  const dismissRejected = async (expenseId: string) => {
    try {
      await API.post(`/expense/rejected/${expenseId}/dismiss`);
      fetchAll();
    } catch (err) {
      console.log(err);
    }
  };

  if (declined.length === 0 && rejected.length === 0) return null;

  return (
    <div className="glass card-animate p-4 mb-4">
      <h2 className="font-bold mb-3">🔔 Notifications</h2>

      {declined.map((group: any) =>
        group.declinedBy.map((user: any) => (
          <div
            key={`${group._id}-${user._id}`}
            className="flex justify-between items-center border-b py-2 last:border-none"
          >
            <p className="text-sm text-gray-700">
              <b>{user.name}</b> declined your invite to "{group.name}"
            </p>
            <button
              onClick={() => dismissDeclined(group._id, user._id)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </div>
        ))
      )}

      {rejected.map((exp: any) => (
        <div
          key={exp._id}
          className="flex justify-between items-center border-b py-2 last:border-none"
        >
          <p className="text-sm text-gray-700">
            Your expense in <b>{exp.group?.name}</b> (₹{exp.amount}) was rejected
          </p>
          <button
            onClick={() => dismissRejected(exp._id)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
