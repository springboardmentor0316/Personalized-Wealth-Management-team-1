import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Goals from "../pages/Goals";
import Simulation from "../pages/Simulation";
import Transactions from "../pages/Transactions";
import Profile from "../pages/Profile";
import Recommendations from "../pages/Recommendations";
import Calculator from "../pages/Calculator"; // ✅ NEW

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="goals" element={<Goals />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="profile" element={<Profile />} />

          
          <Route path="recommendations" element={<Recommendations />} />

          
          <Route path="calculator" element={<Calculator />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}