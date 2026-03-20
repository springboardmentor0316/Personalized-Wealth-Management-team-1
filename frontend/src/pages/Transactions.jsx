import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Trash2,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    symbol: "",
    type: "buy",
    quantity: "",
    price: "",
    fees: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/");
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Transactions fetch error:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async () => {
    if (!form.symbol || !form.quantity || !form.price) {
      toast.error("Fill all required fields");
      return;
    }

    const toastId = toast.loading("Adding transaction...");

    try {
      setCreating(true);

      const quantity = Number(form.quantity);
      const price = Number(form.price);
      const fees = Number(form.fees || 0);

      const res = await API.post("/transactions/", {
        symbol: form.symbol.toUpperCase(),
        type: form.type,
        quantity,
        price,
        fees,
      });

      console.log("Created:", res.data);

      setForm({
        symbol: "",
        type: "buy",
        quantity: "",
        price: "",
        fees: "",
      });

      setIsOpen(false);
      await fetchTransactions();

      toast.success("Transaction added", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Error creating transaction", {
        id: toastId,
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteTransaction = async (id) => {
    const toastId = toast.loading("Deleting transaction...");

    try {
      await API.delete(`/transactions/${id}`);
      await fetchTransactions();

      toast.success("Transaction deleted", { id: toastId });
    } catch {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const getIcon = (type) => {
    if (type === "buy")
      return <ArrowUpCircle className="text-green-600" size={20} />;
    if (type === "sell")
      return <ArrowDownCircle className="text-red-600" size={20} />;
    return <DollarSign className="text-emerald-600" size={20} />;
  };

  const getBadge = (type) => {
    if (type === "buy") return "bg-green-100 text-green-700";
    if (type === "sell") return "bg-red-100 text-red-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getAmount = (t) => {
    const quantity = Number(t.quantity || 0);
    const price = Number(t.price || 0);
    const fees = Number(t.fees || 0);

    const total = quantity * price + fees;

    return t.type === "sell" ? total : -total;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        {" "}
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>{" "}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-500">
            View and manage your transaction history
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={16} /> New Transaction
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Add Transaction</h2>

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="dividend">Dividend</option>
            </select>

            <input
              placeholder="Symbol"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Fees"
              value={form.fees}
              onChange={(e) => setForm({ ...form, fees: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button
                onClick={createTransaction}
                disabled={creating}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl disabled:opacity-70"
              >
                {creating ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-lg">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No transactions yet
          </div>
        ) : (
          transactions.map((t) => {
            const amount = getAmount(t);

            return (
              <div
                key={t.id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    {getIcon(t.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{t.symbol}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full capitalize ${getBadge(t.type)}`}
                      >
                        {t.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {t.quantity} units @ ₹
                      {Number(t.price).toLocaleString("en-IN")}
                      {Number(t.fees) > 0 &&
                        ` • Fees: ₹${Number(t.fees).toLocaleString("en-IN")}`}
                    </p>

                    <p className="text-xs text-gray-400">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleString("en-IN")
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p
                    className={`text-lg font-bold ${
                      amount >= 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {amount >= 0 ? "+" : "-"}₹
                    {Math.abs(amount).toLocaleString("en-IN")}
                  </p>

                  <button onClick={() => deleteTransaction(t.id)}>
                    <Trash2 className="text-red-500" size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
