import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      // Clear old tokens (safety)
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Store tokens
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      toast.success("Login successful!", { id: toastId });

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      const message =
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err.response?.data?.detail?.[0]?.msg ||
            err.response?.data?.message ||
            "Invalid email or password";

      toast.error(message, { id: toastId });

    } finally {
      setLoading(false);
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
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
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

        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/90 to-green-800/90 flex items-center px-20 text-white">
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