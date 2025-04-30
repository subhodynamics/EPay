import { useEffect, useState } from "react";
import apiClient from "../services/api";
import "../styles/Dashboard.css"; // Import the styles

const Dashboard = () => {
  interface Transaction {
    collect_id: string;
    school_id: string;
    gateway: string;
    order_amount: number;
    transaction_amount: number;
    status: string;
    custom_order_id: string;
    student_name: string;
    student_id: string;
    payment_time?: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/transactions")
      .then((res) => {
        setTransactions(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Transactions Dashboard</h1>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              {[
                "Collect ID",
                "School ID",
                "Gateway",
                "Order Amount",
                "Transaction Amount",
                "Status",
                "Custom Order ID",
                "Student Name",
                "Student ID",
                "Payment Time",
              ].map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.collect_id}>
                <td>{tx.collect_id}</td>
                <td>{tx.school_id}</td>
                <td>{tx.gateway}</td>
                <td>{tx.order_amount}</td>
                <td>{tx.transaction_amount}</td>
                <td
                  className={
                    tx.status === "completed"
                      ? "dashboard-status-completed"
                      : tx.status === "failed"
                      ? "dashboard-status-failed"
                      : "dashboard-status-pending"
                  }
                >
                  {tx.status}
                </td>
                <td>{tx.custom_order_id}</td>
                <td>{tx.student_name}</td>
                <td>{tx.student_id}</td>
                <td>
                  {tx.payment_time
                    ? new Date(tx.payment_time).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;