import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

export default function Portfolio() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    symbol: "",
    asset_type: "",
    units: "",
    avg_buy_price: "",
  });

  const fetchInvestments = useCallback(async () => {
    try {
      const res = await API.get("/investments/");
      setData(Array.isArray(res.data) ? res.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
    const interval = setInterval(fetchInvestments, 10000);
    return () => clearInterval(interval);
  }, [fetchInvestments]);

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing prices...");
    try {
      setRefreshing(true);
      await API.post("/investments/refresh-prices");

      setTimeout(async () => {
        await fetchInvestments();
        toast.success("Prices updated", { id: toastId });
        setRefreshing(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Refresh failed", { id: toastId });
      setRefreshing(false);
    }
  };

  const createInvestment = async () => {
    if (!form.symbol || !form.units || !form.avg_buy_price || !form.asset_type) {
      toast.error("Fill all fields");
      return;
    }

    const units = Number(form.units);
    const price = Number(form.avg_buy_price);

    if (isNaN(units) || isNaN(price)) {
      toast.error("Invalid numbers");
      return;
    }

    const toastId = toast.loading("Adding investment...");

    try {
      setCreating(true);

      const cost_basis = units * price;

      await API.post("/investments/", {
        symbol: form.symbol.toUpperCase(),
        asset_type: form.asset_type,
        units,
        avg_buy_price: price,
        cost_basis,
      });

      setForm({
        symbol: "",
        asset_type: "",
        units: "",
        avg_buy_price: "",
      });

      setIsOpen(false);
      fetchInvestments();

      toast.success("Investment added successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || "Failed to add investment",
        { id: toastId }
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteInvestment = async (id) => {
    const toastId = toast.loading("Deleting investment...");

    try {
      await API.delete(`/investments/${id}`);
      fetchInvestments();
      toast.success("Investment deleted", { id: toastId });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error(
        err.response?.data?.detail || err.message || "Delete failed",
        { id: toastId }
      );
    }
  };

  // ✅ CSV DOWNLOAD FUNCTION
  const downloadCSV = async () => {
    try {
      const res = await API.get("/investments/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "portfolio.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const totalValue = data.reduce(
    (sum, i) => sum + Number(i.current_value || 0),
    0
  );
  const totalCost = data.reduce(
    (sum, i) => sum + Number(i.cost_basis || 0),
    0
  );
  const totalProfit = totalValue - totalCost;
  const percent = totalCost
    ? ((totalProfit / totalCost) * 100).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-gray-500">
            Manage your investments and track performance
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex gap-3">

          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            Download CSV
          </button>

          <button
            onClick={handleRefresh}
            className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700"
          >
            <Plus size={16} /> Add Investment
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Add Investment</h2>

            <select
              value={form.asset_type}
              onChange={(e) =>
                setForm({ ...form, asset_type: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            >
              <option value="">Asset Type</option>
              <option value="stock">Stock</option>
              <option value="etf">ETF</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="bond">Bond</option>
              <option value="crypto">Crypto</option>
            </select>

            <input
              placeholder="Symbol"
              value={form.symbol}
              onChange={(e) =>
                setForm({ ...form, symbol: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Units"
              value={form.units}
              onChange={(e) =>
                setForm({ ...form, units: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Avg Buy Price"
              value={form.avg_buy_price}
              onChange={(e) =>
                setForm({ ...form, avg_buy_price: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button
                onClick={createInvestment}
                disabled={creating}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl"
              >
                {creating ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Total Portfolio Value</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{totalValue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Total Invested</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{totalCost.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Total Gain/Loss</p>
          <div className="flex items-center gap-2 mt-2">
            <h2 className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{Math.abs(totalProfit).toLocaleString("en-IN")}
            </h2>
            <span className={totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
              ({totalProfit >= 0 ? "+" : ""}{percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <h2 className="p-6 font-semibold text-lg">Holdings</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-4">Symbol</th>
                <th className="text-left p-4">Type</th>
                <th className="text-right p-4">Units</th>
                <th className="text-right p-4">Avg Price</th>
                <th className="text-right p-4">Cost Basis</th>
                <th className="text-right p-4">Current Value</th>
                <th className="text-right p-4">Gain/Loss</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => {
                const cost = Number(item.cost_basis || 0);
                const value = Number(item.current_value || 0);
                const profit = value - cost;
                const percent = cost ? ((profit / cost) * 100).toFixed(2) : 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold">{item.symbol}</td>
                    <td className="p-4 text-gray-500 capitalize">{item.asset_type}</td>
                    <td className="p-4 text-right">{item.units}</td>
                    <td className="p-4 text-right">₹{Number(item.avg_buy_price).toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right">₹{cost.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right font-semibold">₹{value.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {profit >= 0 ? <TrendingUp className="text-green-600" size={16} /> : <TrendingDown className="text-red-600" size={16} />}
                        <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                          ₹{Math.abs(profit).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({profit >= 0 ? "+" : ""}{percent}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteInvestment(item.id)}>
                        <Trash2 className="text-red-500" size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}