import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Goals from "../pages/Goals";
import Portfolio from "../pages/Portfolio";

export default function AppRoutes() {

  const token = localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Default Redirect */}
        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}