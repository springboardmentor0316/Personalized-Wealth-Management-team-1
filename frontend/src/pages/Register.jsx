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


// ✅ FRONTEND VALIDATION
if (form.name.trim().length < 2) {
  return toast.error("Name must be at least 2 characters");
}

if (form.password.length < 6) {
  return toast.error("Password must be at least 6 characters");
}

setLoading(true);
const toastId = toast.loading("Creating account...");

try {
  await API.post("/auth/register", form);

  toast.success("Registration successful! Please login.", { id: toastId });

  navigate("/login");

} catch (err) {
  const message =
    err.response?.data?.detail?.[0]?.msg ||
    err.response?.data?.detail ||
    err.response?.data?.message ||
    "Registration failed";

  toast.error(message, { id: toastId });

} finally {
  setLoading(false);
}


};

return ( <div className="grid md:grid-cols-2 min-h-screen">


  {/* LEFT IMAGE SECTION */}
  <div className="relative">

    <img
      src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7"
      alt="finance"
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* ✅ FIXED GRADIENT */}
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

  {/* RIGHT FORM SECTION */}
  <div className="flex items-center justify-center bg-gray-50 px-12 py-16">

    <div className="w-105">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-emerald-600 text-white w-10 h-10 flex items-center justify-center rounded-lg text-lg">
          ↗
        </div>
        <h1 className="text-xl font-semibold">
          WealthTrack
        </h1>
      </div>

      {/* Heading */}
      <h2 className="text-4xl font-bold mb-2">
        Create your account
      </h2>

      <p className="text-gray-500 mb-8">
        Get started for free
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Full name
          </label>

          <input
            type="text"
            value={form.name}
            placeholder="Enter your full name"
            required
            className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={(e)=>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            placeholder="you@example.com"
            required
            className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={(e)=>
              setForm({ ...form, email: e.target.value })
            }
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
              value={form.password}
              placeholder="Create a password"
              required
              className="w-full p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e)=>
                setForm({ ...form, password: e.target.value })
              }
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

        {/* Risk Profile */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Risk Profile
          </label>

          <select
            value={form.risk_profile}
            className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={(e)=>
              setForm({ ...form, risk_profile: e.target.value })
            }
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        {/* Login */}
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
