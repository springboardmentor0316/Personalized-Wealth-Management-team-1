import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    risk_profile: "moderate"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!form.name || !form.email || !form.password) {
      return toast.error("Please fill all fields");
    }

    if (form.name.trim().length < 2) {
      return toast.error("Name must be at least 2 characters");
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return toast.error("Enter a valid email");
    }

    // Password validation (matches backend)
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!/[A-Z]/.test(form.password)) {
      return toast.error("Password must contain an uppercase letter");
    }

    if (!/[a-z]/.test(form.password)) {
      return toast.error("Password must contain a lowercase letter");
    }

    if (!/[0-9]/.test(form.password)) {
      return toast.error("Password must contain a number");
    }

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    try {
      await API.post("/auth/register", form);

      toast.success("Registration successful! Please login.", { id: toastId });

      navigate("/login", { replace: true });

    } catch (err) {
      const message =
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err.response?.data?.detail?.[0]?.msg ||
            err.response?.data?.message ||
            "Registration failed";

      toast.error(message, { id: toastId });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-screen">

      {/* LEFT IMAGE */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7"
          alt="finance"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/90 to-green-800/90 flex items-center px-20 text-white">
          <div>
            <h2 className="text-5xl font-bold mb-6">
              Start your wealth journey today
            </h2>

            <p className="text-lg opacity-90">
              Join thousands of users building and tracking their financial future.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-gray-50 px-12 py-16">
        <div className="w-105">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-emerald-600 text-white w-10 h-10 flex items-center justify-center rounded-lg text-lg">
              ↗
            </div>
            <h1 className="text-xl font-semibold">WealthTrack</h1>
          </div>

          <h2 className="text-4xl font-bold mb-2">
            Create your account
          </h2>

          <p className="text-gray-500 mb-8">
            Get started for free
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* Risk */}
            <select
              value={form.risk_profile}
              onChange={(e) =>
                setForm({ ...form, risk_profile: e.target.value })
              }
              className="w-full p-4 rounded-lg bg-gray-200"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-600 font-medium">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}