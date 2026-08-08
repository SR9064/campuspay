import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await API.post("/auth/signup", {
        name,
        email,
        password,
      });

      alert("Signup successful ✅");
      navigate("/");
    } catch (err: any) {
      console.log("Signup error 👉", err.response?.data || err.message);
      alert("Signup failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <div
        className="blob w-96 h-96 bg-blue-400/25"
        style={{ top: "8%", right: "10%" }}
      />
      <div
        className="blob w-80 h-80 bg-emerald-400/30"
        style={{ bottom: "8%", left: "8%", animationDelay: "3s" }}
      />

      <div className="glass card-animate p-10 w-full max-w-md relative z-10 fade-in">

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center text-3xl mb-3 shadow-inner">
            ✨
          </div>
          <h2 className="text-3xl font-bold text-center">
            Create Account
          </h2>
        </div>

        <input
          placeholder="Name"
          className="border-0 bg-white/70 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="border-0 bg-white/70 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border-0 bg-white/70 p-3 w-full mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:opacity-90 text-white py-3 rounded-xl transition font-semibold shadow-lg"
        >
          Sign Up
        </button>

        <p className="text-center mt-5 text-sm opacity-80">
          Already have an account?{" "}
          <span
            className="text-emerald-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}
