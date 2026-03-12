export default function Dashboard() {
  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <div className="bg-white px-4 py-2 rounded-lg shadow">
          👤 Test User
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Portfolio</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Monthly Investment</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Goals Achieved</p>
        </div>

      </div>

      {/* ================= PORTFOLIO SECTION ================= */}
      <div className="grid grid-cols-2 gap-6">

        {/* Portfolio Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Portfolio Performance
          </h3>

          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart Coming Soon 📈
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Recent Transactions
          </h3>
        </div>

      </div>

    </div>
  );
}