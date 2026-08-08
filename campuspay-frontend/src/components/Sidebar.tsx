import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="sidebar-metal w-64 min-h-screen text-white p-6 shadow-xl flex flex-col justify-between">

      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-10">
          💸 CampusPay
        </h2>

        <div className="space-y-4">

          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              isActive("/dashboard")
                ? "bg-white text-blue-900 font-semibold"
                : "hover:bg-white/10"
            }`}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate("/groups")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              isActive("/groups")
                ? "bg-white text-blue-900 font-semibold"
                : "hover:bg-white/10"
            }`}
          >
            👥 Groups
          </button>

          <button
            onClick={() => navigate("/wallet")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              isActive("/wallet")
                ? "bg-white text-blue-900 font-semibold"
                : "hover:bg-white/10"
            }`}
          >
            💳 Wallet
          </button>

        </div>
      </div>

      <button
        onClick={handleLogout}
        className="relative z-10 w-full text-left px-4 py-2 rounded-lg transition hover:bg-red-500/20 border border-white/20"
      >
        🚪 Logout
      </button>

    </div>
  );
}
