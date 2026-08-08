import { useEffect, useState } from "react";
import API from "../api/api";

export default function GroupDashboard({ groupId }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) {
      setData(null);
      return;
    }

    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/expense/group-dashboard/${groupId}`
      );

      setData(res.data);
    } catch (err: any) {
      console.log(
        "Group dashboard error 👉",
        err.response?.data || err.message
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATES ================= */

  if (!groupId) {
    return (
      <div className="glass card-animate p-6">
        <p className="text-gray-600">
          Select a group to view details 👆
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass card-animate p-6">
        Loading group...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass card-animate p-6">
        <p className="text-red-600 font-medium">
          Failed to load group data ❌
        </p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="glass card-animate p-6">

      {/* 🔥 TITLE WITH GROUP NAME */}
      <h2 className="font-bold mb-4 text-lg">
        {data.groupName
          ? `Breakdown (${data.groupName})`
          : "Group Summary"}
      </h2>

      {/* 💰 SUMMARY */}
      <div className="flex gap-4 mb-4">
        <div className="bg-white/40 backdrop-blur p-3 rounded-lg flex-1">
          <p className="text-sm text-gray-700">You Owe</p>
          <p className="text-red-600 font-semibold">
            ₹ {(data.youOwe || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur p-3 rounded-lg flex-1">
          <p className="text-sm text-gray-700">You Are Owed</p>
          <p className="text-emerald-700 font-semibold">
            ₹ {(data.youAreOwed || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 👥 MEMBERS */}
      <h3 className="font-semibold mb-2">Members</h3>

      {!data.members || data.members.length === 0 ? (
        <p className="text-gray-600">No balances</p>
      ) : (
        data.members.map((m: any) => {
          const net = Number(m.net || 0);

          return (
            <div
              key={m.user?._id}
              className="flex justify-between border-b border-white/20 py-2"
            >
              <span className="text-gray-800 font-medium">
                {m.user?.name || "Unknown"}
              </span>

              {net > 0 ? (
                <span className="text-emerald-700 font-medium">
                  owes you ₹ {net.toFixed(2)}
                </span>
              ) : net < 0 ? (
                <span className="text-red-600 font-medium">
                  you owe ₹ {Math.abs(net).toFixed(2)}
                </span>
              ) : (
                <span className="text-gray-500">
                  settled
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
