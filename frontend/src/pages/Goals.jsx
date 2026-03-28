import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Plus, Target, Home, Plane, GraduationCap,
  Car, Heart, Shield, Trash2, PauseCircle, CheckCircle,
} from "lucide-react";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    goal_type: "",
    name: "",
    target_amount: "",
    target_date: "",
    monthly_contribution: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals/");
      setGoals(res.data || []);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (
      !form.goal_type ||
      !form.target_amount ||
      !form.target_date ||
      !form.monthly_contribution
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const toastId = toast.loading("Creating goal...");
    try {
      setCreating(true);
      await API.post("/goals/", {
        goal_type: form.goal_type.toLowerCase(),
        // FIX: name is now accepted by backend schema and persisted to DB
        name: form.name || null,
        target_amount: Number(form.target_amount),
        target_date: form.target_date,
        monthly_contribution: Number(form.monthly_contribution),
      });

      setForm({
        goal_type: "",
        name: "",
        target_amount: "",
        target_date: "",
        monthly_contribution: "",
      });
      setIsOpen(false);
      fetchGoals();
      toast.success("Goal created successfully", { id: toastId });
    } catch (err) {
      toast.error(
        err.response?.data?.detail?.[0]?.msg ||
          err.response?.data?.detail ||
          "Failed to create goal",
        { id: toastId },
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteGoal = async (id) => {
    const toastId = toast.loading("Deleting goal...");
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
      toast.success("Goal deleted", { id: toastId });
    } catch {
      toast.error("Delete failed", { id: toastId });
    }
  };

  // FIX: status update — pause or complete a goal
  const updateStatus = async (id, status) => {
    const toastId = toast.loading("Updating status...");
    try {
      await API.patch(`/goals/${id}/status`, { status });
      fetchGoals();
      toast.success(`Goal marked as ${status}`, { id: toastId });
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail || err.message || "Status update failed",
        { id: toastId },
      );
    }
  };

  const goalIcons = {
    retirement: Target,
    home: Home,
    travel: Plane,
    education: GraduationCap,
    car: Car,
    wedding: Heart,
    emergency: Shield,
    medical: Shield,
    custom: Target,
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-gray-500">
            Plan and track your financial objectives
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Create Goal</h2>

            <select
              value={form.goal_type}
              onChange={(e) => setForm({ ...form, goal_type: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            >
              <option value="">Select Type *</option>
              <option value="retirement">Retirement</option>
              <option value="home">Home</option>
              <option value="travel">Travel</option>
              <option value="education">Education</option>
              <option value="car">Car</option>
              <option value="wedding">Wedding</option>
              <option value="emergency">Emergency</option>
              <option value="medical">Medical</option>
              <option value="custom">Custom</option>
            </select>

            <input
              placeholder="Goal Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Target Amount *"
              value={form.target_amount}
              onChange={(e) =>
                setForm({ ...form, target_amount: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="date"
              value={form.target_date}
              onChange={(e) =>
                setForm({ ...form, target_date: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <input
              type="number"
              placeholder="Monthly Contribution *"
              value={form.monthly_contribution}
              onChange={(e) =>
                setForm({ ...form, monthly_contribution: e.target.value })
              }
              className="w-full p-3 bg-gray-100 rounded-xl"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={createGoal}
                disabled={creating}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl disabled:opacity-70"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No goals yet</p>
          <p className="text-sm">Start building your future 🚀</p>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const Icon = goalIcons[goal.goal_type?.toLowerCase()] || Target;
            const target = Number(goal.target_amount || 0);
            const monthly = Number(goal.monthly_contribution || 0);
            const progress = target ? ((monthly * 12) / target) * 100 : 0;
            const percent = Math.min(progress, 100).toFixed(0);
            const monthsRemaining = Math.max(
              0,
              Math.round(
                (new Date(goal.target_date) - new Date()) /
                  (1000 * 60 * 60 * 24 * 30),
              ),
            );

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Icon className="text-emerald-600" size={22} />
                    </div>
                    <div>
                      {/* FIX: name is now returned from backend and displayed */}
                      <h3 className="font-semibold text-lg capitalize">
                        {goal.name || `${goal.goal_type} Fund`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 capitalize">
                          {goal.goal_type}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[goal.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {goal.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* FIX: pause / complete buttons using new PATCH /status endpoint */}
                    {goal.status === "active" && (
                      <button
                        onClick={() => updateStatus(goal.id, "paused")}
                        title="Pause goal"
                      >
                        <PauseCircle className="text-yellow-500" size={18} />
                      </button>
                    )}
                    {goal.status !== "completed" && (
                      <button
                        onClick={() => updateStatus(goal.id, "completed")}
                        title="Mark complete"
                      >
                        <CheckCircle className="text-blue-500" size={18} />
                      </button>
                    )}
                    {goal.status === "paused" && (
                      <button
                        onClick={() => updateStatus(goal.id, "active")}
                        title="Resume goal"
                        className="text-xs text-emerald-600 font-medium"
                      >
                        Resume
                      </button>
                    )}
                    <button onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="text-red-500" size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-emerald-600 font-semibold">
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Monthly</p>
                    <p className="text-lg font-bold">
                      ₹{monthly.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="text-lg font-bold">
                      ₹{target.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Date</span>
                    <span className="font-medium">
                      {new Date(goal.target_date).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining</span>
                    <span className="font-medium">
                      {monthsRemaining} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Projected</span>
                    <span className="font-semibold text-green-600">
                      ₹{(monthly * monthsRemaining).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
