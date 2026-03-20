import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex">

      {/*  SIDEBAR */}
      <div className="fixed top-0 left-0 h-screen w-64 z-50">
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="ml-64 flex-1 h-screen overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </div>

    </div>
  );
}