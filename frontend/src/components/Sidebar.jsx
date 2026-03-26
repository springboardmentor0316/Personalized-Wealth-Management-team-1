import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Briefcase,
  ArrowLeftRight,
  User,
  BarChart3,
  LogOut,
  Lightbulb,
  Calculator, // ✅ NEW ICON
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await API.post("/auth/logout", { token: refreshToken });
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-emerald-600";

  const activeClass = "bg-emerald-600 text-white";

  return (
    <aside className="h-full bg-emerald-700 text-white p-6 flex flex-col justify-between">

      {/* TOP SECTION */}
      <div>
        <h1 className="text-2xl font-bold mb-10">WealthTrack</h1>

        <nav className="space-y-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Target size={18} />
            Goals
          </NavLink>

          <NavLink
            to="/portfolio"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Briefcase size={18} />
            Portfolio
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <ArrowLeftRight size={18} />
            Transactions
          </NavLink>

          <NavLink
            to="/simulation"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <BarChart3 size={18} />
            Simulation
          </NavLink>

          <NavLink
            to="/recommendations"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Lightbulb size={18} />
            Recommendations
          </NavLink>

          {/* ✅ NEW CALCULATOR */}
          <NavLink
            to="/calculator"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Calculator size={18} />
            Calculator
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <User size={18} />
            Profile
          </NavLink>
        </nav>
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}