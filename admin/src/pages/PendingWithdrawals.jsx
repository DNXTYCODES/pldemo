import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";

const PendingWithdrawals = ({ token }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const resp = await fetch(backendUrl + "/api/withdrawal/admin/pending", {
        headers: { Authorization: token },
      });
      const data = await resp.json();
      if (data.success) setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const confirm = async (id) => {
    const notes = prompt("Admin notes (optional):");
    try {
      const resp = await fetch(
        backendUrl + "/api/withdrawal/admin/confirm/" + id,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ adminNotes: notes }),
        },
      );
      const data = await resp.json();
      if (data.success) fetchWithdrawals();
      else alert(data.message || "Failed");
    } catch (err) {
      console.error(err);
      alert("Error confirming withdrawal");
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      const resp = await fetch(
        backendUrl + "/api/withdrawal/admin/reject/" + id,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ reason }),
        },
      );
      const data = await resp.json();
      if (data.success) fetchWithdrawals();
      else alert(data.message || "Failed");
    } catch (err) {
      console.error(err);
      alert("Error rejecting withdrawal");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Withdrawals</h1>
      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No pending withdrawals</p>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w) => (
            <div key={w._id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {w.userId?.name} &lt;{w.userId?.email}&gt;
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: {w.amountEth} ETH — To: {w.ethereumAddress}
                  </p>
                  {w.withdrawalCodeId && (
                    <p className="text-xs text-gray-500">
                      Code: {w.withdrawalCodeId.code}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(w.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => confirm(w._id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => reject(w._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingWithdrawals;
