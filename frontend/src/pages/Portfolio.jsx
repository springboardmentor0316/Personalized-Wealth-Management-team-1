import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [assetType, setAssetType] = useState("");
  const [symbol, setSymbol] = useState("");
  const [units, setUnits] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [lastPrice, setLastPrice] = useState("");

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Fetch Investments
  const fetchInvestments = async () => {
    try {
      const res = await API.get("/investments");
      setInvestments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Create Investment
  const createInvestment = async () => {
    if (
      !assetType ||
      !symbol ||
      !units ||
      !avgBuyPrice ||
      !costBasis ||
      !currentValue
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await API.post("/investments", {
        asset_type: assetType,
        symbol: symbol,
        units: Number(units),
        avg_buy_price: Number(avgBuyPrice),
        cost_basis: Number(costBasis),
        current_value: Number(currentValue),
        last_price: Number(lastPrice || currentValue),
      });

      // Reset form
      setAssetType("");
      setSymbol("");
      setUnits("");
      setAvgBuyPrice("");
      setCostBasis("");
      setCurrentValue("");
      setLastPrice("");

      fetchInvestments();
    } catch (err) {
      console.error(err);
      alert("Failed to create investment");
    }
  };

  // Delete Investment
  const deleteInvestment = async (id) => {
    try {
      await API.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate portfolio totals
  const totalCostBasis = investments.reduce(
    (sum, inv) => sum + Number(inv.cost_basis),
    0
  );
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + Number(inv.current_value),
    0
  );
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const gainLossPercent =
    totalCostBasis > 0 ? ((totalGainLoss / totalCostBasis) * 100).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Cost Basis</p>
          <p className="text-xl font-bold">₹{totalCostBasis.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Current Value</p>
          <p className="text-xl font-bold">₹{totalCurrentValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Gain/Loss</p>
          <p
            className={`text-xl font-bold ${
              totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{totalGainLoss.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Return %</p>
          <p
            className={`text-xl font-bold ${
              gainLossPercent >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {gainLossPercent}%
          </p>
        </div>
      </div>

      {/* Add Investment Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Investment</h2>

        <div className="grid grid-cols-4 gap-4">
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="">Select Asset Type</option>
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="bond">Bond</option>
            <option value="cash">Cash</option>
          </select>

          <input
            placeholder="Symbol (e.g., TCS)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            placeholder="Units"
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            placeholder="Avg Buy Price"
            type="number"
            value={avgBuyPrice}
            onChange={(e) => setAvgBuyPrice(e.target.value)}
            className="border p-3 rounded"
          />
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <input
            placeholder="Cost Basis"
            type="number"
            value={costBasis}
            onChange={(e) => setCostBasis(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            placeholder="Current Value"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            placeholder="Last Price (optional)"
            type="number"
            value={lastPrice}
            onChange={(e) => setLastPrice(e.target.value)}
            className="border p-3 rounded"
          />

          <button
            onClick={createInvestment}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
          >
            Add Investment
          </button>
        </div>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        {investments.length === 0 && (
          <p className="text-gray-500">No investments yet.</p>
        )}

        {investments.map((inv) => {
          const gainLoss = Number(inv.current_value) - Number(inv.cost_basis);
          const gainLossPercent =
            Number(inv.cost_basis) > 0
              ? ((gainLoss / Number(inv.cost_basis)) * 100).toFixed(2)
              : 0;

          return (
            <div
              key={inv.id}
              className="bg-white border p-6 rounded-xl shadow flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex gap-8">
                  <div>
                    <p>
                      <strong>Symbol:</strong> {inv.symbol}
                    </p>
                    <p>
                      <strong>Asset Type:</strong> {inv.asset_type}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Units:</strong> {inv.units}
                    </p>
                    <p>
                      <strong>Avg Price:</strong> ₹{inv.avg_buy_price}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Cost Basis:</strong> ₹{inv.cost_basis}
                    </p>
                    <p>
                      <strong>Current Value:</strong> ₹{inv.current_value}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`font-semibold ${
                        gainLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Gain/Loss: ₹{gainLoss.toFixed(2)}
                    </p>
                    <p
                      className={`font-semibold ${
                        gainLossPercent >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Return: {gainLossPercent}%
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteInvestment(inv.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
