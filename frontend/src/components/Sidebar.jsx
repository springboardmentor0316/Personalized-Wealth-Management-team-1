import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass =
    "block px-3 py-2 rounded-lg hover:bg-emerald-600 transition";

  const activeClass = "bg-emerald-600 text-white";

  return (
    <aside className="w-64 bg-emerald-700 text-white p-6 flex flex-col justify-between">

      <div>
        <h1 className="text-2xl font-bold mb-10">WealthTrack</h1>

        <nav className="space-y-3">

          <NavLink to="/dashboard" className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`}>
            Dashboard
          </NavLink>

          <NavLink to="/goals" className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`}>
            Goals
          </NavLink>

          <NavLink to="/portfolio" className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`}>
            Portfolio
          </NavLink>

          <NavLink to="/transactions" className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`}>
            Transactions
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`}>
            Profile
          </NavLink>

        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-medium"
      >
        Logout
      </button>

    </aside>
  );
}