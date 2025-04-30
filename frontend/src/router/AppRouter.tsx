import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import TransactionDetails from "../pages/TransactionDetails";
import TransactionStatus from "../pages/TransactionStatus";
import Login from "../pages/login";
import Register from "../pages/Register";
import HomeModal from "../pages/HomeModal";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeModal />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transaction-details" element={<TransactionDetails />} />
        <Route path="/transaction-status" element={<TransactionStatus />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;