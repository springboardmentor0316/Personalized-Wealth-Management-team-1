import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  return (
    <nav className="bg-emerald-700 text-white flex items-center justify-between px-10 py-5 shadow sticky top-0 z-45">

      {/* Logo */}
      <Link to="/dashboard" className="text-xl font-semibold">
        WealthTrack
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">

        <Link to="/dashboard" className="hover:opacity-80">
          Dashboard
        </Link>

        <Link to="/profile" className="hover:opacity-80">
          Profile
        </Link>

        <Link to="/goals">Goals</Link>

        <button
          onClick={handleLogout}
          className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

