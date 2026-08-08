import { useEffect, useState } from "react";
import API from "../api/api";

export default function GroupTabs({ selectedGroup, setSelectedGroup }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await API.get("/group");

      const cleanGroups =
        res.data?.groups?.filter(
          (g: any) => g.name && g.name.trim() !== ""
        ) || [];

      setGroups(cleanGroups);

      if (cleanGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(cleanGroups[0]._id);
      }

    } catch (err: any) {
      console.log(
        "GroupTabs error 👉",
        err.response?.data || err.message
      );
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (groupId: string, groupName: string) => {
    const confirmed = window.confirm(`Leave "${groupName}"? You'll need to be re-invited to rejoin.`);
    if (!confirmed) return;

    try {
      await API.post(`/group/${groupId}/leave`);
      if (selectedGroup === groupId) {
        setSelectedGroup("");
      }
      fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to leave group ❌");
    }
  };

  if (loading) {
    return (
      <div className="mb-4 text-gray-200">
        Loading groups...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="glass card-animate p-4 mb-4 text-gray-600">
        No groups found. Create one from the Dashboard 👇
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {groups.map((g) => (
        <div
          key={g._id}
          className={`flex items-center gap-1 rounded-full pl-4 pr-2 py-1.5 text-sm transition ${
            selectedGroup === g._id
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white/25 backdrop-blur text-white hover:bg-white/35 border border-white/20"
          }`}
        >
          <button
            onClick={() => setSelectedGroup(g._id)}
            className="whitespace-nowrap"
          >
            {g.name}
          </button>
          <button
            onClick={() => handleLeave(g._id, g.name)}
            title="Leave group"
            className={`ml-1 rounded-full w-5 h-5 flex items-center justify-center text-xs transition ${
              selectedGroup === g._id
                ? "hover:bg-white/20"
                : "hover:bg-red-500/40"
            }`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
