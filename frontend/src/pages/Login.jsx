import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      navigate("/profile");

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen">

      {/* LEFT SECTION */}
      <div className="flex items-center justify-center bg-gray-50">

        <div className="w-full max-w-md px-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-emerald-600 text-white p-3 rounded-lg">
              ↗
            </div>
            <h1 className="text-xl font-semibold">WealthTrack</h1>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-2">
            Welcome back
          </h2>

          <p className="text-gray-500 mb-8">
            Sign in to your account
          </p>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-2">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                  className="w-full p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                 {/* Eye icon  */}
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Sign in
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-600 font-medium"
              >
                Sign up
              </Link>
            </p>

          </form>

        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="relative">

        <img
          src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7"
          alt="finance"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-green-800/90 flex items-center px-20 text-white">

          <div>
            <h2 className="text-5xl font-bold mb-6">
              Track your wealth with confidence
            </h2>

            <p className="text-lg opacity-90">
              Manage your investments and monitor portfolio performance all in one place.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

