import { useState } from "react";
import { PiggyBank, Calculator as CalcIcon, CreditCard } from "lucide-react";

export default function Calculator() {
  const [tab, setTab] = useState("sip");

  const [sip, setSip] = useState({
    monthly: 5000,
    years: 10,
    rate: 12,
  });
  const [sipResult, setSipResult] = useState(null);

  const [ret, setRet] = useState({
    age: 30,
    retireAge: 60,
    savings: 100000,
    monthly: 2000,
    rate: 8,
    inflation: 3,
  });
  const [retResult, setRetResult] = useState(null);

  const [loan, setLoan] = useState({
    amount: 250000,
    rate: 7,
    years: 30,
  });
  const [loanResult, setLoanResult] = useState(null);

  const handleTabChange = (key) => {
    setTab(key);
    setSipResult(null);
    setRetResult(null);
    setLoanResult(null);
  };

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
    <div className="p-6 bg-gray-50 h-[calc(100vh-64px)] overflow-hidden flex flex-col">

      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Financial Calculators</h1>
        <p className="text-gray-500">
          Plan your finances with powerful tools
        </p>
      </div>

      {/* TABS */}
      <div className="bg-gray-100 p-1 rounded-full flex gap-2 max-w-2xl mb-4">
        {[
          { key: "sip", label: "SIP", icon: PiggyBank },
          { key: "ret", label: "Retirement", icon: CalcIcon },
          { key: "loan", label: "Loan", icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
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

      {/* MAIN CONTENT */}
      <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden">

        {/* LEFT */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between">

          {tab === "sip" && (
            <>
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">SIP Calculator</h2>

                <input
                  type="number"
                  value={sip.monthly}
                  onChange={(e) => setSip({ ...sip, monthly: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                />

                <input
                  type="number"
                  value={sip.years}
                  onChange={(e) => setSip({ ...sip, years: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                />

                <input
                  type="number"
                  value={sip.rate}
                  onChange={(e) => setSip({ ...sip, rate: e.target.value })}
                  className="w-full p-3 bg-gray-100 rounded-xl"
                />
              </div>

              <button
                onClick={calcSIP}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
              >
                Calculate
              </button>
            </>
          )}

          {tab === "ret" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input value={ret.age} onChange={(e) => setRet({ ...ret, age: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
                <input value={ret.retireAge} onChange={(e) => setRet({ ...ret, retireAge: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
                <input value={ret.savings} onChange={(e) => setRet({ ...ret, savings: e.target.value })} className="col-span-2 p-3 bg-gray-100 rounded-xl" />
                <input value={ret.monthly} onChange={(e) => setRet({ ...ret, monthly: e.target.value })} className="col-span-2 p-3 bg-gray-100 rounded-xl" />
                <input value={ret.rate} onChange={(e) => setRet({ ...ret, rate: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
                <input value={ret.inflation} onChange={(e) => setRet({ ...ret, inflation: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
              </div>

              <button
                onClick={calcRet}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
              >
                Calculate
              </button>
            </>
          )}

          {tab === "loan" && (
            <>
              <div className="space-y-4">
                <input value={loan.amount} onChange={(e) => setLoan({ ...loan, amount: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
                <input value={loan.rate} onChange={(e) => setLoan({ ...loan, rate: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
                <input value={loan.years} onChange={(e) => setLoan({ ...loan, years: e.target.value })} className="p-3 bg-gray-100 rounded-xl" />
              </div>

              <button
                onClick={calcLoan}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
              >
                Calculate
              </button>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-center">

          {!sipResult && !retResult && !loanResult && (
            <p className="text-gray-400 text-center">
              Results will appear here
            </p>
          )}

          {tab === "sip" && sipResult && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                ₹{sipResult.total.toLocaleString()}
              </div>
              <div className="p-4 bg-gray-100 rounded-xl">
                ₹{sipResult.invested.toLocaleString()}
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-green-600">
                ₹{sipResult.returns.toLocaleString()}
              </div>
            </div>
          )}

          {tab === "ret" && retResult && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-xl font-bold text-purple-600">
                ₹{retResult.total.toLocaleString()}
              </div>
              <div className="p-4 bg-gray-100 rounded-xl">
                ₹{retResult.contributions.toLocaleString()}
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-green-600">
                ₹{retResult.growth.toLocaleString()}
              </div>
            </div>
          )}

          {tab === "loan" && loanResult && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                EMI ₹{loanResult.emi.toFixed(0)}
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-red-600">
                ₹{loanResult.interest.toFixed(0)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}