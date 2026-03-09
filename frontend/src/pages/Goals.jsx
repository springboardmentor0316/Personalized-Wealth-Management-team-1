import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Goals() {

  const [goals, setGoals] = useState([]);

  const [goalType, setGoalType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetch Goals
  const fetchGoals = async () => {

    try {

      const res = await API.get("/goals");

      setGoals(res.data);

      setLoading(false);

    } catch (err) {

      console.error(err);

    }

  };

  // Create Goal
  const createGoal = async () => {

    if (!goalType || !targetAmount || !targetDate || !monthlyContribution) {
      alert("Please fill all fields");
      return;
    }

    try {

      await API.post("/goals", {
        goal_type: goalType,
        target_amount: Number(targetAmount),
        target_date: targetDate,
        monthly_contribution: Number(monthlyContribution)
      });

      setGoalType("");
      setTargetAmount("");
      setTargetDate("");
      setMonthlyContribution("");

      fetchGoals();

    } catch (err) {

      console.error(err);
      alert("Failed to create goal");

    }

  };

  // Delete Goal
  const deleteGoal = async (id) => {

    try {

      await API.delete(`/goals/${id}`);

      fetchGoals();

    } catch (err) {

      console.error(err);

    }

  };

  if (loading) {

    return (
      <div className="p-6">
        <p className="text-gray-500">Loading goals...</p>
      </div>
    );

  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Goals</h1>

      {/* Create Goal Form */}

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>

        <div className="grid grid-cols-4 gap-4">
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="">Select Goal Type</option>
            <option value="retirement">Retirement</option>
            <option value="home">Home</option>
            <option value="education">Education</option>
            <option value="car">Car</option>
            <option value="travel">Travel</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency Fund</option>
            <option value="wedding">Wedding</option>
            <option value="custom">Custom</option>
          </select>

          <input
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="border p-3 rounded"
          />

          <input
            placeholder="Monthly Contribution"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="border p-3 rounded"
          />
        </div>

        <button
          onClick={createGoal}
          className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}

      <div className="space-y-4">
        {goals.length === 0 && (
          <p className="text-gray-500">No goals created yet.</p>
        )}

        {goals.map((goal) => {
          const progress =
            ((goal.monthly_contribution * 12) / goal.target_amount) * 100;

          return (
            <div
              key={goal.id}
              className="bg-white border p-6 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Goal Type:</strong> {goal.goal_type}
                </p>

                <p>
                  <strong>Target Amount:</strong> ₹{goal.target_amount}
                </p>

                <p>
                  <strong>Monthly Contribution:</strong> ₹
                  {goal.monthly_contribution}
                </p>

                <p>
                  <strong>Target Date:</strong> {goal.target_date}
                </p>

                {/* Progress Bar */}

                <div className="mt-4">
                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                      className="bg-emerald-600 h-3 rounded"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {Math.min(progress, 100).toFixed(0)}% progress
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteGoal(goal.id)}
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