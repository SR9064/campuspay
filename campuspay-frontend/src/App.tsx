import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Group from "./pages/Group";
import Sidebar from "./components/Sidebar";
import WalletPage from "./pages/Wallet";
import DarkToggle from "./components/DarkToggle";

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">

      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 overflow-y-auto fade-in">

        {/* 🌙 Toggle */}
        <div className="flex justify-end mb-4">
          <DarkToggle />
        </div>

        {children}
      </div>

    </div>
  );
}

/* ================= APP ================= */
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* 🔐 Auth Pages (no sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 📊 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 👥 Groups */}
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Layout>
                <Group />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 💳 Wallet */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Layout>
                <WalletPage />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
