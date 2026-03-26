import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { History } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/recommendations/");
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/recommendations/history");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const ideal = data.ideal || {};
  const current = data.current || {};
  const rebalance = data.rebalance || {};

  const chartData = Object.entries(ideal).map(([key, value]) => ({
    name: key,
    value,
  }));

  const riskValue =
    typeof data.risk_profile === "object"
      ? data.risk_profile?.value
      : data.risk_profile || "Unknown";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Investment Recommendations
          </h1>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl shadow-sm text-sm"
          >
            <History size={16} />
            Past Recommendations ({history.length})
          </button>
        </div>

        {/* HISTORY */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="font-semibold text-lg">
              Recommendation History
            </h2>

            {history.length === 0 ? (
              <p className="text-gray-400">No history yet</p>
            ) : (
              history.map((rec) => (
                <div
                  key={rec.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm text-gray-500">
                      {rec.recommendation_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(rec.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-sm text-right space-y-1">
                    {Object.entries(rec.suggested_allocation || {}).map(
                      ([k, v]) => (
                        <p key={k} className="capitalize">
                          <span className="text-gray-500">{k}:</span>{" "}
                          <span className="font-semibold">{v}%</span>
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RISK PROFILE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Your Risk Profile</p>
          <h2 className="text-2xl font-bold capitalize mt-1">
            {riskValue}
          </h2>
          <p className="text-gray-500 mt-2">
            {data.advice || "No advice available"}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* CURRENT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Current Allocation
              </h2>

              {Object.entries(current).map(([key, value]) => (
                <p key={key} className="capitalize">
                  {key}: {value}%
                </p>
              ))}
            </div>

            {/* REBALANCE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Rebalancing Suggestions
              </h2>

              {Object.entries(rebalance).map(([key, value]) => (
                <p key={key} className="capitalize">
                  {value > 0
                    ? `Increase ${key} by ${value}%`
                    : value < 0
                    ? `Reduce ${key} by ${Math.abs(value)}%`
                    : `No change in ${key}`}
                </p>
              ))}
            </div>

          </div>

          {/* RIGHT SIDE (PIE CHART) */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Ideal Allocation 📊
              </h2>

              <div className="h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={120}
                      label={({ name, value }) =>
                        `${name}: ${value}%`
                      }
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}