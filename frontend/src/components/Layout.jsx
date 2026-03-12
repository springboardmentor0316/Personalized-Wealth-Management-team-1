import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}