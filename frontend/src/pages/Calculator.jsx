import { useState } from "react";
import { PiggyBank, Calculator as CalcIcon, CreditCard } from "lucide-react";

export default function Calculator() {
  const [tab, setTab] = useState("sip");

  // SIP
  const [sip, setSip] = useState({
    monthly: 5000,
    years: 10,
    rate: 12,
  });
  const [sipResult, setSipResult] = useState(null);

  // RETIREMENT
  const [ret, setRet] = useState({
    age: 30,
    retireAge: 60,
    savings: 100000,
    monthly: 2000,
    rate: 8,
    inflation: 3,
  });
  const [retResult, setRetResult] = useState(null);

  // LOAN
  const [loan, setLoan] = useState({
    amount: 250000,
    rate: 7,
    years: 30,
  });
  const [loanResult, setLoanResult] = useState(null);

  // TAB SWITCH RESET
  const handleTabChange = (key) => {
    setTab(key);
    setSipResult(null);
    setRetResult(null);
    setLoanResult(null);
  };

  // SIP CALC
  const calcSIP = () => {
    const r = sip.rate / 100 / 12;
    const n = sip.years * 12;

    const total =
      sip.monthly *
      (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

    const invested = sip.monthly * n;

    setSipResult({
      invested,
      returns: total - invested,
      total,
    });
  };

  // RETIREMENT CALC
  const calcRet = () => {
    const years = ret.retireAge - ret.age;
    const r = ret.rate / 100 / 12;
    const n = years * 12;

    const fvSavings = ret.savings * Math.pow(1 + r, n);
    const fvMonthly =
      ret.monthly *
      (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

    const total = fvSavings + fvMonthly;
    const contributions = ret.monthly * n;

    setRetResult({
      total,
      contributions,
      growth: total - contributions - ret.savings,
    });
  };

  // LOAN CALC
  const calcLoan = () => {
    const r = loan.rate / 100 / 12;
    const n = loan.years * 12;

    const emi =
      (loan.amount * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

    const total = emi * n;

    setLoanResult({
      emi,
      interest: total - loan.amount,
      total,
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Financial Calculators</h1>
        <p className="text-gray-500 mt-1">
          Plan your finances with powerful calculation tools
        </p>
      </div>

      {/* TABS */}
      <div className="bg-gray-100 p-1 rounded-full flex gap-2 max-w-2xl">
        {[
          { key: "sip", label: "SIP Calculator", icon: PiggyBank },
          { key: "ret", label: "Retirement", icon: CalcIcon },
          { key: "loan", label: "Loan Payoff", icon: CreditCard },
        ].map(({ key, label  }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === key
                ? "bg-white shadow text-black"
                : "text-gray-500"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* SIP */}
          {tab === "sip" && (
            <>
              <h2 className="font-semibold text-lg mb-4">SIP Calculator</h2>

              <div className="space-y-4">
                <input
                  type="number"
                  value={sip.monthly}
                  onChange={(e) => setSip({ ...sip, monthly: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                  placeholder="Monthly Investment"
                />

                <input
                  type="number"
                  value={sip.years}
                  onChange={(e) => setSip({ ...sip, years: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                  placeholder="Years"
                />

                <input
                  type="number"
                  value={sip.rate}
                  onChange={(e) => setSip({ ...sip, rate: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                  placeholder="Return %"
                />

                <button
                  onClick={calcSIP}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl"
                >
                  Calculate
                </button>
              </div>
            </>
          )}

          {/* RETIREMENT */}
          {tab === "ret" && (
            <>
              <h2 className="font-semibold text-lg mb-4">Retirement Calculator</h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  value={ret.age}
                  onChange={(e) => setRet({ ...ret, age: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Current Age"
                />

                <input
                  value={ret.retireAge}
                  onChange={(e) => setRet({ ...ret, retireAge: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Retirement Age"
                />

                <input
                  value={ret.savings}
                  onChange={(e) => setRet({ ...ret, savings: e.target.value })}
                  className="col-span-2 p-3 bg-gray-100 rounded-xl"
                  placeholder="Savings"
                />

                <input
                  value={ret.monthly}
                  onChange={(e) => setRet({ ...ret, monthly: e.target.value })}
                  className="col-span-2 p-3 bg-gray-100 rounded-xl"
                  placeholder="Monthly Contribution"
                />

                <input
                  value={ret.rate}
                  onChange={(e) => setRet({ ...ret, rate: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Return %"
                />

                <input
                  value={ret.inflation}
                  onChange={(e) => setRet({ ...ret, inflation: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Inflation %"
                />

                <button
                  onClick={calcRet}
                  className="col-span-2 bg-blue-600 text-white py-3 rounded-xl"
                >
                  Calculate
                </button>
              </div>
            </>
          )}

          {/* LOAN */}
          {tab === "loan" && (
            <>
              <h2 className="font-semibold text-lg mb-4">Loan Payoff Calculator</h2>

              <div className="space-y-4">
                <input
                  value={loan.amount}
                  onChange={(e) => setLoan({ ...loan, amount: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Loan Amount"
                />

                <input
                  value={loan.rate}
                  onChange={(e) => setLoan({ ...loan, rate: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Interest %"
                />

                <input
                  value={loan.years}
                  onChange={(e) => setLoan({ ...loan, years: e.target.value })}
                  className="p-3 bg-gray-100 rounded-xl"
                  placeholder="Years"
                />

                <button
                  onClick={calcLoan}
                  className="bg-blue-600 text-white py-3 rounded-xl w-full"
                >
                  Calculate
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE (ONLY AFTER CALCULATION) */}
        {(sipResult || retResult || loanResult) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg">Results</h2>

            {/* SIP */}
            {tab === "sip" && sipResult && (
              <>
                <div className="p-4 bg-blue-50 rounded-xl">
                  Total: ₹{sipResult.total.toLocaleString()}
                </div>
                <div className="p-4 bg-gray-100 rounded-xl">
                  Invested: ₹{sipResult.invested.toLocaleString()}
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-green-600">
                  Returns: ₹{sipResult.returns.toLocaleString()}
                </div>
              </>
            )}

            {/* RETIREMENT */}
            {tab === "ret" && retResult && (
              <>
                <div className="p-4 bg-purple-50 border rounded-xl">
                  <p>Retirement Corpus</p>
                  <h3 className="text-2xl font-bold text-purple-600">
                    ₹{retResult.total.toLocaleString()}
                  </h3>
                </div>

                <div className="p-4 bg-gray-100 rounded-xl">
                  ₹{retResult.contributions.toLocaleString()}
                </div>

                <div className="p-4 bg-green-50 rounded-xl text-green-600">
                  ₹{retResult.growth.toLocaleString()}
                </div>
              </>
            )}

            {/* LOAN */}
            {tab === "loan" && loanResult && (
              <>
                <div className="p-4 bg-blue-50 rounded-xl">
                  EMI: ₹{loanResult.emi.toFixed(0)}
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-red-600">
                  Interest: ₹{loanResult.interest.toFixed(0)}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}