import { useEffect, useState } from "react";
import API from "../api/api";

export default function GroupInvites({ onResponded }: any) {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await API.get("/group/invites");
      setInvites(res.data.invites || []);
    } catch (err) {
      console.log("Invites fetch error", err);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (groupId: string, action: "accept" | "decline") => {
    try {
      await API.post(`/group/invites/${groupId}/${action}`);
      fetchInvites();
      onResponded?.();
    } catch (err: any) {
      console.log("Invite response error", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed ❌");
    }
  };

  if (loading) return null;
  if (invites.length === 0) return null;

  return (
    <div className="glass card-animate p-4 mb-4">
      <h2 className="font-bold mb-3">📩 Group Invites</h2>

      {invites.map((inv: any) => (
        <div
          key={inv._id}
          className="flex justify-between items-center border-b py-3 last:border-none"
        >
          <div>
            <p className="font-medium text-gray-700">{inv.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Invited by {inv.createdBy?.name || "Unknown"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => respond(inv._id, "accept")}
              className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => respond(inv._id, "decline")}
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
