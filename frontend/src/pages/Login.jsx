import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="grid grid-cols-2 min-h-screen">

      {/* LEFT SECTION — CENTERED FORM */}
      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-emerald-600 text-white p-3 rounded-lg">
              ↗
            </div>
            <h1 className="text-xl font-semibold">WealthTrack</h1>
          </div>

          <h2 className="text-4xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          {/* FORM */}
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-2 p-4 rounded-lg bg-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-2">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-4 rounded-lg bg-gray-200 outline-none"
                />
                
              </div>
            </div>

            <button className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition">
              Sign in
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION — IMAGE */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-emerald-700/90 flex items-center px-20 text-white">
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