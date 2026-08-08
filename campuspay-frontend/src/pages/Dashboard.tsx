import { useEffect, useState } from "react";
import API from "../api/api";
import AddExpense from "../components/AddExpense";
import CreateGroup from "../components/CreateGroup";
import GroupInvites from "../components/GroupInvites";
import PendingExpenses from "../components/PendingExpenses";
import Notifications from "../components/Notifications";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState("");

  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupData, setGroupData] = useState<any>(null);

  const [reloadGroups, setReloadGroups] = useState(0);

  useEffect(() => {
    fetchDashboard();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/user/me");
      setUserName(res.data.name);
    } catch (err) {
      console.log("User fetch error", err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/expense/dashboard");
      setData(res.data);
    } catch (err) {
      console.log("Dashboard error", err);
    }
  };

  const fetchGroupDashboard = async (groupId: string) => {
    try {
      const res = await API.get(`/expense/group-dashboard/${groupId}`);
      setGroupData(res.data);
    } catch (err) {
      console.log("Group dashboard error", err);
      setGroupData(null);
    }
  };

  const handleGroupCreated = () => {
    setReloadGroups((prev) => prev + 1);
    fetchDashboard();
  };

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">

{/* 🔥 Header */}
      <div className="fade-in mb-8" style={{ animationDelay: "0ms" }}>
        <h1 className="text-4xl font-extrabold mb-2 brand-text">
          💸 CampusPay
        </h1>
        <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>
          Welcome back, {userName || "..."}
        </p>
      </div>

      {/* 📩 Notifications tier */}
      <div className="fade-in space-y-4 mb-6" style={{ animationDelay: "80ms" }}>
        <GroupInvites onResponded={handleGroupCreated} />
        <PendingExpenses onResponded={handleGroupCreated} />
        <Notifications />
      </div>

{/* 💰 SUMMARY */}
      <div className="grid md:grid-cols-2 gap-6 mb-6 fade-in" style={{ animationDelay: "160ms" }}>
        <div className="glass glass-accent card-animate p-8">
          <p style={{ color: "var(--text-muted)" }}>Total You Owe (All Groups)</p>
          <p className="text-red-400 text-3xl font-bold mt-3">
            ₹ {(data.youOwe || 0).toFixed(2)}
          </p>
        </div>

        <div className="glass glass-accent card-animate p-8">
          <p style={{ color: "var(--text-muted)" }}>Total You Are Owed (All Groups)</p>
          <p className="text-emerald-400 text-3xl font-bold mt-3">
            ₹ {(data.youAreOwed || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 💡 EXPLANATION */}
      <div className="mb-6 text-sm opacity-70 bg-white/10 backdrop-blur p-4 rounded-xl fade-in" style={{ animationDelay: "220ms" }}>
        💡 <b>How to read this:</b><br />
        • Top cards = totals across <b>all groups</b><br />
        • Breakdown = values for <b>selected group only</b>
      </div>

      {/* 🧱 MAIN GRID */}
      <div className="grid lg:grid-cols-2 gap-6 fade-in" style={{ animationDelay: "280ms" }}>

        <div className="space-y-6">

          <div className="glass card-animate p-8">
            <CreateGroup onGroupCreated={handleGroupCreated} />
          </div>

          <div className="glass card-animate p-8">
            <AddExpense
              refresh={fetchDashboard}
              reloadGroups={reloadGroups}
              onGroupSelect={(id: string) => {
                setSelectedGroup(id);

                if (id) {
                  fetchGroupDashboard(id);
                } else {
                  setGroupData(null);
                }
              }}
            />
          </div>

        </div>

        <div className="space-y-6">

          <div
            className={`glass card-animate p-8 ${
              selectedGroup ? "ring-2 ring-emerald-400/60" : ""
            }`}
          >
            <h2 className="text-lg font-semibold mb-5">
              {selectedGroup
                ? `Group Breakdown → ${groupData?.groupName || ""}`
                : "Global Breakdown (All Groups)"}
            </h2>

            {selectedGroup ? (
              !groupData || !groupData.members?.length ? (
                <p className="opacity-60">No balances in this group</p>
              ) : (
                groupData.members.map((m: any) => (
                  <div
                    key={m.user?._id}
                    className="flex justify-between py-3 border-b border-white/10 last:border-none"
                  >
                    <span className="font-medium">
                      {m.user?.name || "Unknown"}
                    </span>

                    {m.net > 0 ? (
                      <span className="text-emerald-500 font-semibold">
                        owes you ₹ {m.net.toFixed(2)}
                      </span>
                    ) : m.net < 0 ? (
                      <span className="text-red-500 font-semibold">
                        you owe ₹ {Math.abs(m.net).toFixed(2)}
                      </span>
                    ) : (
                      <span className="opacity-50">
                        settled
                      </span>
                    )}
                  </div>
                ))
              )
            ) : (
              !data.breakdown?.length ? (
                <p className="opacity-60">No balances yet</p>
              ) : (
                data.breakdown.map((item: any) => (
                  <div
                    key={item.user?._id}
                    className="flex justify-between py-3 border-b border-white/10 last:border-none"
                  >
                    <span className="font-medium">
                      {item.user?.name || "Unknown"}
                    </span>

                    {item.net > 0 ? (
                      <span className="text-emerald-500 font-semibold">
                        owes you ₹ {item.net.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        you owe ₹ {Math.abs(item.net).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
