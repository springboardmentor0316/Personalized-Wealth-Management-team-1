import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { Play, History, Trash2 } from "lucide-react";

export default function Simulation() {
  const [amount, setAmount] = useState("");
  const [years, setYears] = useState("");
  const [rate, setRate] = useState("");
  const [scenarioName, setScenarioName] = useState("");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIX: simulation history state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // FIX: fetch history on mount
  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get("/simulations/");
      setHistory(res.data || []);
    } catch {
      // silently ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteSimulation = async (id) => {
    try {
      await API.delete(`/simulations/${id}`);
      fetchHistory();
      toast.success("Simulation deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const generateChartData = (monthly, years) => {
    const rates = { conservative: 8, moderate: 12, aggressive: 15 };
    let totals = { conservative: 0, moderate: 0, aggressive: 0 };
    const data = [];

    for (let i = 1; i <= years * 12; i++) {
      Object.keys(rates).forEach((key) => {
        const r = rates[key] / 100 / 12;
        totals[key] = (totals[key] + monthly) * (1 + r);
      });

      if (i % 12 === 0) {
        data.push({
          year: `Year ${i / 12}`,
          conservative: Math.round(totals.conservative),
          moderate: Math.round(totals.moderate),
          aggressive: Math.round(totals.aggressive),
          invested: monthly * i,
        });
      }
    }
    return data;
  };

  const runSimulation = async () => {
    if (!amount || !years || !rate) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/simulations/run", {
        monthly_investment: Number(amount),
        years: Number(years),
        return_rate: Number(rate),
        // FIX: pass optional scenario name to backend
        scenario_name: scenarioName || "Custom Simulation",
      });

      setResult({
        value: res.data.future_value,
        invested: Number(amount) * Number(years) * 12,
        profit: res.data.future_value - Number(amount) * Number(years) * 12,
      });

      setChartData(generateChartData(Number(amount), Number(years)));
      toast.success("Simulation completed!");

      // FIX: refresh history after each run
      fetchHistory();
    } catch {
      toast.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  // Load a past simulation into the form
  const loadFromHistory = (sim) => {
    const a = sim.assumptions;
    setAmount(a.monthly_investment || "");
    setYears(a.years || "");
    setRate(a.return_rate || "");
    setScenarioName(sim.scenario_name || "");
    setShowHistory(false);
    toast("Simulation loaded — press Run to recalculate", { icon: "📂" });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">What-If Simulation</h1>
          <p className="text-gray-500">Compare different investment strategies over time</p>
        </div>
        {/* FIX: toggle to show simulation history */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm"
        >
          <History size={16} />
          History ({history.length})
        </button>
      </div>

      {/* HISTORY PANEL */}
      {showHistory && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-lg">Past Simulations</h2>
          {historyLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400">No simulations yet</p>
          ) : (
            history.map((sim) => (
              <div
                key={sim.id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
              >
                <div>
                  <p className="font-medium">{sim.scenario_name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{Number(sim.assumptions.monthly_investment).toLocaleString("en-IN")}/mo ·{" "}
                    {sim.assumptions.years} yrs · {sim.assumptions.return_rate}% return
                  </p>
                  <p className="text-xs text-gray-400">
                    Future value: ₹{Number(sim.results.future_value).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadFromHistory(sim)}
                    className="text-sm text-emerald-600 font-medium px-3 py-1 bg-emerald-50 rounded-lg"
                  >
                    Load
                  </button>
                  <button onClick={() => deleteSimulation(sim.id)}>
                    <Trash2 className="text-red-400" size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-semibold text-lg">Parameters</h2>

          <input
            placeholder="Scenario Name (optional)"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 outline-none"
          />

          <input
            type="number"
            placeholder="Monthly Investment (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 outline-none"
          />

          <input
            type="number"
            placeholder="Years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 outline-none"
          />

          <input
            type="number"
            placeholder="Expected Return (%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 outline-none"
          />

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-70"
          >
            <Play size={16} />
            {loading ? "Calculating..." : "Run Simulation"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Total Invested</p>
                <h2 className="text-2xl font-bold mt-1">
                  ₹{Math.round(result.invested).toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Future Value</p>
                <h2 className="text-2xl font-bold mt-1 text-green-600">
                  ₹{Math.round(result.value).toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Estimated Profit</p>
                <h2 className="text-2xl font-bold mt-1 text-green-600">
                  ₹{Math.round(result.profit).toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-4">Scenario Comparison 📊</h3>

            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`} />
                    <Legend />
                    <Area type="monotone" dataKey="invested" stroke="#6b7280" fillOpacity={0.1} name="Invested" />
                    <Area type="monotone" dataKey="conservative" stroke="#3b82f6" fillOpacity={0.1} name="Conservative (8%)" />
                    <Area type="monotone" dataKey="moderate" stroke="#10b981" fillOpacity={0.2} name="Moderate (12%)" />
                    <Area type="monotone" dataKey="aggressive" stroke="#f59e0b" fillOpacity={0.2} name="Aggressive (15%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 text-center">
                <div>
                  <Play size={40} className="mx-auto mb-2" />
                  <p>Run a simulation to compare scenarios</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
