import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Play } from "lucide-react";

export default function Simulation() {
  const [amount, setAmount] = useState("");
  const [years, setYears] = useState("");
  const [rate, setRate] = useState("");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateChartData = (monthly, years, rate) => {
    let data = [];
    let total = 0;
    let monthlyRate = rate / 100 / 12;

    for (let i = 1; i <= years * 12; i++) {
      total = (total + monthly) * (1 + monthlyRate);

      if (i % 12 === 0) {
        data.push({
          year: `Year ${i / 12}`,
          value: Math.round(total),
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
      });

      const futureValue = res.data.future_value;

      setResult({
        value: futureValue,
        invested: Number(amount) * Number(years) * 12,
        profit: futureValue - Number(amount) * Number(years) * 12,
      });

      const chart = generateChartData(
        Number(amount),
        Number(years),
        Number(rate),
      );

      setChartData(chart);

      toast.success("Simulation completed!");
    } catch (err) {
      console.error(err);
      toast.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">What-If Simulation</h1>
        <p className="text-gray-500">
          Model how your investments grow over time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-semibold text-lg">Simulation Parameters</h2>

          <input
            type="number"
            placeholder="Monthly Investment (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            type="number"
            placeholder="Years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            type="number"
            placeholder="Expected Return (%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <button
            onClick={runSimulation}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700"
          >
            <Play size={16} />
            {loading ? "Calculating..." : "Run Simulation"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {/* RESULT CARDS */}
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

          {/* CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-4">Projection Chart</h3>

            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    {/* GRADIENT */}
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />

                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        fontSize: "13px",
                      }}
                      formatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                      fill="url(#colorValue)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 text-center">
                <div>
                  <Play size={40} className="mx-auto mb-2" />
                  <p>Run simulation to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
