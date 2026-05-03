import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";

const PendingWithdrawalFees = ({ token }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const resp = await fetch(backendUrl + "/api/withdrawal/admin/fees/pending", {
        headers: { Authorization: token },
      });
      const data = await resp.json();
      if (data.success) setFees(data.fees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const confirmFee = async (id) => {
    const notes = prompt("Admin notes (optional):");
    try {
      const resp = await fetch(backendUrl + "/api/withdrawal/admin/fees/confirm/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ adminNotes: notes }),
      });
      const data = await resp.json();
      if (data.success) fetchFees();
      else alert(data.message || "Failed");
    } catch (err) {
      console.error(err);
      alert("Error confirming fee");
    }
  };

  const rejectFee = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      const resp = await fetch(backendUrl + "/api/withdrawal/admin/fees/reject/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ reason }),
      });
      const data = await resp.json();
      if (data.success) fetchFees();
      else alert(data.message || "Failed");
    } catch (err) {
      console.error(err);
      alert("Error rejecting fee");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Withdrawal Fees</h1>
      {loading ? (
        <p>Loading...</p>
      ) : fees.length === 0 ? (
        <p>No pending fees</p>
      ) : (
        <div className="space-y-4">
          {fees.map((f) => (
            <div key={f._id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{f.userId?.name} &lt;{f.userId?.email}&gt;</p>
                  <p className="text-sm text-gray-600">Fee: {f.amountEth} ETH — Withdraw amount: {f.withdrawAmountEth || f.amountEth} ETH</p>
                  <p className="text-xs text-gray-400">Requested: {new Date(f.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => confirmFee(f._id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Confirm</button>
                  <button onClick={() => rejectFee(f._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingWithdrawalFees;
