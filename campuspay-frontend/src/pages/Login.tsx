import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("userId", payload.userId);

      navigate("/dashboard");
    } catch (err: any) {
      console.log("Login error 👉", err.response?.data || err.message);
      alert("Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* 🫧 Ambient glow blobs */}
      <div
        className="blob w-96 h-96 bg-emerald-400/30"
        style={{ top: "10%", left: "8%" }}
      />
      <div
        className="blob w-80 h-80 bg-blue-400/25"
        style={{ bottom: "5%", right: "10%", animationDelay: "3s" }}
      />

      <div className="glass card-animate p-10 w-full max-w-md relative z-10 fade-in">

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center text-3xl mb-3 shadow-inner">
            💸
          </div>
          <h2 className="text-3xl font-bold text-center">
            CampusPay
          </h2>
        </div>

        <p className="text-center opacity-70 mb-6">
          Login to continue
        </p>

        <input
          type="email"
          placeholder="Email"
          className="border-0 bg-white/70 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border-0 bg-white/70 p-3 w-full mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90 text-white py-3 rounded-xl transition font-semibold shadow-lg"
        >
          Login
        </button>

        <p className="text-center mt-5 text-sm opacity-80">
          New user?{" "}
          <span
            className="text-emerald-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}
