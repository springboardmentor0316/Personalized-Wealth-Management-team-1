import { useEffect, useState } from "react";
import API from "../api/axios";
import { TrendingUp, Target, Briefcase, DollarSign } from "lucide-react";

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

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // ✅ SAFE USER FETCH (handles 404)
      let userData = {};
      try {
        const userRes = await API.get("/users/me");
        userData = userRes.data;
      } catch {
        console.log("User API not available");
      }

      // ✅ FETCH OTHER DATA
      const [goalsRes, invRes, txnRes] = await Promise.all([
        API.get("/goals"),
        API.get("/investments/"),
        API.get("/transactions/"),
      ]);

      const goalsData = goalsRes.data || [];
      const invData = invRes.data || [];
      const txnData = txnRes.data || [];

      setUser(userData);
      setGoals(goalsData);
      setInvestments(invData);
      setTransactions(txnData);

      // ✅ SAFE SUMMARY CALCULATION
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

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const completedGoals = goals.filter(
    (g) => g.monthly_contribution * 12 >= g.target_amount
  ).length;

  const portfolioData = investments.map((item) => ({
    name: item.symbol,
    value: Number(item.current_value || 0),
  }));

  const profit = summary?.profit || 0;
  const isProfit = profit >= 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-gray-500">{new Date().toDateString()}</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* PORTFOLIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Portfolio Value</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{Number(summary?.total_value || 0).toLocaleString("en-IN")}
            </h2>
            <p className={`${isProfit ? "text-green-600" : "text-red-600"} text-sm mt-1`}>
              {isProfit ? "+" : "-"}₹{Math.abs(profit).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-blue-500 p-2 rounded-lg">
            <Briefcase size={18} className="text-white" />
          </div>
        </div>

        {/* GOALS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Goals</p>
            <h2 className="text-2xl font-bold mt-1">{goals.length}</h2>
            <p className="text-green-600 text-sm mt-1">
              {completedGoals} achieved
            </p>
          </div>
          <div className="bg-purple-500 p-2 rounded-lg">
            <Target size={18} className="text-white" />
          </div>
        </div>

        {/* PROFIT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Profit</p>
            <h2 className={`text-2xl font-bold mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}>
              ₹{Math.abs(profit).toLocaleString("en-IN")}
            </h2>
            <p className="text-gray-500 text-sm mt-1">overall return</p>
          </div>
          <div className="bg-green-500 p-2 rounded-lg">
            <TrendingUp size={18} className="text-white" />
          </div>
        </div>

        {/* INVESTED */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Invested</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{Number(summary?.total_invested || 0).toLocaleString("en-IN")}
            </h2>
            <p className="text-gray-500 text-sm mt-1">ROI active</p>
          </div>
          <div className="bg-orange-500 p-2 rounded-lg">
            <DollarSign size={18} className="text-white" />
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Portfolio Growth</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={portfolioData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
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
                    <Cell key={i} fill="#10b981" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GOALS + TRANSACTIONS */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* GOALS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Goal Progress</h3>

          {goals.length === 0 ? (
            <p className="text-gray-500">No goals yet</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progress =
                  ((goal.monthly_contribution * 12) / goal.target_amount) * 100;

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

        {/* TRANSACTIONS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>

          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 4).map((t) => {

                const amount =
                  (Number(t.quantity || 0) * Number(t.price || 0)) +
                  Number(t.fees || 0);

                const signed = t.type === "sell" ? amount : -amount;

                return (
                  <div key={t.id} className="flex justify-between bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="font-medium">{t.symbol}</p>
                      <p className="text-sm text-gray-500">{t.type}</p>
                    </div>

                    <p className={`font-semibold ${signed >= 0 ? "text-green-600" : "text-red-600"}`}>
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