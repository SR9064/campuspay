import { useState } from "react";
import GroupTabs from "../components/GroupTabs";
import GroupDashboard from "../components/GroupDashboard";
import ExpenseHistory from "../components/ExpenseHistory";
import Settlement from "../components/Settlement";

export default function Groups() {
  const [selectedGroup, setSelectedGroup] = useState("");

  return (
    <div className="px-6 py-4 fade-in">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">👥 Groups</h1>

      <GroupTabs
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      {!selectedGroup ? (
        <div className="glass card-animate p-8 text-center text-gray-600 mt-4">
          Select a group to view details 👆
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 space-y-4">
            <ExpenseHistory groupId={selectedGroup} />
            <Settlement groupId={selectedGroup} />
          </div>
          <div className="space-y-4">
            <GroupDashboard groupId={selectedGroup} />
          </div>
        </div>
      )}
    </div>
  );
}
