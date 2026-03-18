import { useEffect, useState } from "react";
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

  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState("buy");
  const [txSymbol, setTxSymbol] = useState("");
  const [txUnits, setTxUnits] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txInvestmentId, setTxInvestmentId] = useState("");
  const [txNotes, setTxNotes] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  useEffect(() => {
    fetchInvestments();
    fetchTransactions();
  }, []);

  // Fetch Investments
  const fetchInvestments = async () => {
    try {
      const res = await API.get("/investments/");
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
      await API.post("/investments/", {
        asset_type: assetType,
        symbol,
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
      const message =
        err.response?.data?.detail ||
        err.message ||
        "Failed to create investment";
      alert(Array.isArray(message) ? JSON.stringify(message) : message);
    }
  };

  // Delete Investment
  const deleteInvestment = async (id) => {
    try {
      await API.delete(`/investments/${id}`);
      fetchInvestments();
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch transactions for dashboard
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Transaction
  const createTransaction = async () => {
    if (!txSymbol || !txUnits || !txPrice || !transactionType) {
      alert("Please fill transaction symbol, units, and price");
      return;
    }

    try {
      await API.post("/transactions/", {
        transaction_type: transactionType,
        symbol: txSymbol,
        units: Number(txUnits),
        price: Number(txPrice),
        total_amount: Number(txUnits) * Number(txPrice),
        investment_id: txInvestmentId ? Number(txInvestmentId) : null,
        notes: txNotes,
      });

      setTxSymbol("");
      setTxUnits("");
      setTxPrice("");
      setTxInvestmentId("");
      setTxNotes("");

      fetchInvestments();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        "Failed to save transaction";
      alert(Array.isArray(message) ? JSON.stringify(message) : message);
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
    totalCostBasis > 0
      ? ((totalGainLoss / totalCostBasis) * 100).toFixed(2)
      : 0;

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
          <p className="text-xl font-bold">{formatCurrency(totalCostBasis)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Current Value</p>
          <p className="text-xl font-bold">{formatCurrency(totalCurrentValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Gain/Loss</p>
          <p
            className={`text-xl font-bold ${
              totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totalGainLoss)}
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

      {/* Transaction Tracker */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
        <div className="grid grid-cols-6 gap-3">
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="border p-3 rounded col-span-1"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
          <input
            placeholder="Symbol"
            value={txSymbol}
            onChange={(e) => setTxSymbol(e.target.value)}
            className="border p-3 rounded col-span-1"
          />
          <input
            placeholder="Units"
            type="number"
            value={txUnits}
            onChange={(e) => setTxUnits(e.target.value)}
            className="border p-3 rounded col-span-1"
          />
          <input
            placeholder="Price"
            type="number"
            value={txPrice}
            onChange={(e) => setTxPrice(e.target.value)}
            className="border p-3 rounded col-span-1"
          />
          <input
            placeholder="Investment ID (optional)"
            type="number"
            value={txInvestmentId}
            onChange={(e) => setTxInvestmentId(e.target.value)}
            className="border p-3 rounded col-span-1"
          />
          <button
            onClick={createTransaction}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 col-span-1"
          >
            Save Transaction
          </button>
        </div>
        <input
          placeholder="Notes (optional)"
          value={txNotes}
          onChange={(e) => setTxNotes(e.target.value)}
          className="border p-3 rounded w-full mt-3"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Inv ID</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2">{tx.transaction_type}</td>
                    <td className="px-3 py-2">{tx.symbol}</td>
                    <td className="px-3 py-2">{tx.units}</td>
                    <td className="px-3 py-2">{formatCurrency(tx.price)}</td>
                    <td className="px-3 py-2">{formatCurrency(tx.total_amount)}</td>
                    <td className="px-3 py-2">{tx.investment_id || "-"}</td>
                    <td className="px-3 py-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                      <strong>Avg Price:</strong> {formatCurrency(inv.avg_buy_price)}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Cost Basis:</strong> {formatCurrency(inv.cost_basis)}
                    </p>
                    <p>
                      <strong>Current Value:</strong> {formatCurrency(inv.current_value)}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`font-semibold ${
                        gainLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Gain/Loss: {formatCurrency(gainLoss)}
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
