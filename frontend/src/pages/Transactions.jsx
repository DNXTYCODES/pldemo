import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const Transactions = () => {
  const { navigate, backendUrl, token, ethPrice } = useContext(ShopContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError("No authentication token found. Please login first.");
          setLoading(false);
          return;
        }

        const response = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        if (data.success && data.user && data.user.transactions) {
          setTransactions(Array.isArray(data.user.transactions) ? data.user.transactions : []);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Error loading transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token, backendUrl]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "deposit":
        return "text-green-600";
      case "upload_approval":
        return "text-amber-600";
      case "purchase":
        return "text-blue-600";
      case "withdrawal":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20 px-4">
        <div className="text-center">
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Transactions</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          {["all", "completed", "pending", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900">
                    Amount (ETH)
                  </th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900">
                    Amount (USD)
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold ${getTypeColor(tx.type)}`}>
                      {tx.type.charAt(0).toUpperCase() +
                        tx.type.slice(1).replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {tx.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-gray-900">
                      {parseFloat(tx.amountEth || tx.amountEth).toFixed(8)}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-gray-900">
                      ${parseFloat(tx.amountUsd || "0").toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Total Deposits</p>
              <p className="text-2xl font-bold text-green-600">
                ${filteredTransactions
                  .filter((tx) => tx.type === "deposit" && tx.status === "completed")
                  .reduce((sum, tx) => sum + parseFloat(tx.amountUsd || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-amber-600">
                ${filteredTransactions
                  .filter((tx) => tx.type === "upload_approval" && tx.status === "completed")
                  .reduce((sum, tx) => sum + parseFloat(tx.amountUsd || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-blue-600">
                ${filteredTransactions
                  .filter((tx) => tx.type === "purchase" && tx.status === "completed")
                  .reduce((sum, tx) => sum + parseFloat(tx.amountUsd || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
