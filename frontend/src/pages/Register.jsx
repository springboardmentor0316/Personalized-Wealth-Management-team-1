import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    risk_profile: "moderate"
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await API.post("/auth/register", form);

      navigate("/login");

    } catch (error) {

      console.log(error);
      alert("Registration failed");

    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen">

      {/* LEFT IMAGE SECTION */}
      <div className="relative">

        <img
          src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7"
          alt="finance"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-green-800/90 flex items-center px-20 text-white">

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

        <div className="w-[420px]">

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

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full name
              </label>

              <input
                type="text"
                placeholder="John Doe"
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
                className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e)=>
                  setForm({ ...form, risk_profile: e.target.value })
                }
              >
                <option value="conservative">
                  Conservative
                </option>

                <option value="moderate">
                  Moderate
                </option>

                <option value="aggressive">
                  Aggressive
                </option>

              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Create account
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 font-medium"
              >
                Sign in
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}