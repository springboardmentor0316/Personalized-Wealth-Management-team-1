

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-10">

        {/* Profile Header */}
        <div className="flex flex-col items-center">

          {/* Profile Image */}
          <img
            src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />

          {/* Name */}
          <h2 className="text-2xl font-bold mt-4">
            Ayushman Dhal
          </h2>

          <p className="text-gray-500">WealthTrack User</p>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-6 mt-10">

          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold mt-1">
              ayushman@email.com
            </p>
          </div>

          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-sm text-gray-500">Risk Profile</p>
            <p className="font-semibold text-emerald-600 mt-1">
              Moderate
            </p>
          </div>

          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-sm text-gray-500">KYC Status</p>
            <p className="font-semibold text-green-600 mt-1">
              Verified
            </p>
          </div>

          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold mt-1">Jan 2026</p>
          </div>

        </div>

      </div>
    </div>
  );
}