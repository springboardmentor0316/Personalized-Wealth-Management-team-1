import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {

  return (
    <div className="h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

    </div>
  );
}

