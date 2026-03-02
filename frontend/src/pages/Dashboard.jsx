export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-emerald-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">WealthTrack</h1>

        <nav className="space-y-4">
          <p className="cursor-pointer hover:text-gray-200">Dashboard</p>
          <p className="cursor-pointer hover:text-gray-200">Goals</p>
          <p className="cursor-pointer hover:text-gray-200">Portfolio</p>
          <p className="cursor-pointer hover:text-gray-200">Transactions</p>
          <p className="cursor-pointer hover:text-gray-200">Reports</p>
        </nav>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>

          <div className="bg-white px-4 py-2 rounded-lg shadow">
            👤 Test  User
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

          {/* Portfolio Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              Portfolio Performance
            </h3>

            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart Coming Soon 📈
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              Recent Transactions
            </h3>

            
          </div>

        </div>

      </main>
    </div>
  );
}