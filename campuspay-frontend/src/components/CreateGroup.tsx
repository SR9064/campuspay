import { useEffect, useState } from "react";
import API from "../api/api";

export default function CreateGroup({ onGroupCreated }: any) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/user");
      setUsers(res.data.users || []);
    } catch (err) {
      console.log("User fetch error", err);
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name) {
      alert("Enter group name ❌");
      return;
    }

    try {
      setLoading(true);

      await API.post("/group/create", {
        name,
        members: selectedUsers
      });

      alert("Group created ✅ Invites sent — they'll join once accepted.");

      setName("");
      setSelectedUsers([]);

      onGroupCreated();

    } catch (err: any) {
      console.log("Create group error", err.response?.data || err.message);
      alert("Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Create Group</h2>

      <input
        placeholder="Group Name"
        className="border-0 bg-white/70 dark:bg-white/10 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p className="text-sm opacity-70 mb-3">
        Selected people will be invited — they join once they accept.
      </p>

      <div className="mb-5 max-h-40 overflow-y-auto border border-white/20 p-3 rounded-xl space-y-2">
        {users.length === 0 ? (
          <p className="opacity-60 text-sm">No users found</p>
        ) : (
          users.map((u) => (
            <label key={u._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedUsers.includes(u._id)}
                onChange={() => toggleUser(u._id)}
              />
              <span>{u.name} ({u.email})</span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className={`px-5 py-2.5 rounded-xl text-white font-medium transition ${
          loading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
