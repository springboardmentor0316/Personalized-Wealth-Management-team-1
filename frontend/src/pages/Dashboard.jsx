import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Target,
  Briefcase,
  DollarSign,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      let userData = {};
      try {
        const userRes = await API.get("/profile/");
        userData = userRes.data;
      } catch (err) {
        console.error(err);
      }

      const [goalsRes, invRes, txnRes] = await Promise.all([
        API.get("/goals/"),
        API.get("/investments/"),
        API.get("/transactions/"),
      ]);

      const goalsData = Array.isArray(goalsRes.data) ? goalsRes.data : [];
      const invData = Array.isArray(invRes.data) ? invRes.data : [];
      const txnData = Array.isArray(txnRes.data) ? txnRes.data : [];

      setUser(userData);
      setGoals(goalsData);
      setInvestments(invData);
      setTransactions(txnData);

      const totalValue = invData.reduce(
        (sum, i) => sum + Number(i.current_value || 0),
        0
      );

      const totalInvested = invData.reduce(
        (sum, i) => sum + Number(i.cost_basis || 0),
        0
      );

      const profit = totalValue - totalInvested;

      setSummary({
        total_value: totalValue,
        total_invested: totalInvested,
        profit,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    const toastId = toast.loading("Refreshing market data...");

    try {
      setRefreshing(true);
      await API.post("/investments/refresh-prices");
      await fetchAll();
      toast.success("Prices updated successfully", { id: toastId });
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error("Failed to refresh prices", { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const completedGoals = goals.filter((g) => {
    const progress =
      (g.current_amount || g.monthly_contribution * 12) /
      (g.target_amount || 1);
    return progress >= 1;
  }).length;

  const portfolioData = investments.map((item) => ({
    name: item.symbol,
    value: Number(item.current_value || 0),
  }));

  const profit = summary?.profit || 0;
  const isProfit = profit >= 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-gray-500">{new Date().toDateString()}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
  onClick={refreshPrices}
  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition duration-200"
>
  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
  {refreshing ? "Refreshing..." : "Refresh Prices"}
</button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Portfolio Value</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{Number(summary?.total_value || 0).toLocaleString("en-IN")}
            </h2>
            <p className={`${isProfit ? "text-green-600" : "text-red-600"} text-sm mt-1`}>
              {isProfit ? "+" : "-"}₹{Math.abs(profit).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-blue-500/10 p-2 rounded-md">
            <Briefcase className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Active Goals</p>
            <h2 className="text-2xl font-bold mt-1">{goals.length}</h2>
            <p className="text-green-600 text-sm mt-1">
              {completedGoals} achieved
            </p>
          </div>
          <div className="bg-purple-500/10 p-2 rounded-md">
            <Target className="text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Profit / Loss</p>
            <h2 className={`text-2xl font-bold mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : "-"}₹{Math.abs(profit).toLocaleString("en-IN")}
            </h2>
            <p className="text-gray-500 text-sm mt-1">overall return</p>
          </div>
          <div className="bg-green-500/10 p-2 rounded-md">
            <TrendingUp className="text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Invested</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{Number(summary?.total_invested || 0).toLocaleString("en-IN")}
            </h2>
            <p className="text-gray-500 text-sm mt-1">cost basis</p>
          </div>
          <div className="bg-orange-500/10 p-2 rounded-md">
            <DollarSign className="text-orange-600" />
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Portfolio Value by Asset</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98133" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Asset Allocation</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={portfolioData} dataKey="value" outerRadius={90}>
                  {portfolioData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GOALS + TRANSACTIONS */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Goal Progress</h3>

          {goals.length === 0 ? (
            <p>No goals yet</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progress =
                  ((goal.current_amount || goal.monthly_contribution * 12) /
                    (goal.target_amount || 1)) *
                  100;

                return (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.goal_type}</span>
                      <span>{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <div className="bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>

          {transactions.length === 0 ? (
            <p>No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 4).map((t) => {
                const amount =
                  Number(t.quantity || 0) * Number(t.price || 0) +
                  Number(t.fees || 0);

                const signed = t.type === "sell" ? amount : -amount;

                return (
                  <div key={t.id} className="flex justify-between bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="font-medium">{t.symbol}</p>
                      <p className="text-sm text-gray-500">{t.type}</p>
                    </div>
                    <p className={signed >= 0 ? "text-green-600" : "text-red-600"}>
                      {signed >= 0 ? "+" : "-"}₹{Math.abs(signed).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}