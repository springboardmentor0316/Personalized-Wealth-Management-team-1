import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </div>
  );
}

export default App;