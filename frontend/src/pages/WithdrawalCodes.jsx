import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const WithdrawalCodes = () => {
  const { backendUrl } = useContext(ShopContext);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your codes");
          setLoading(false);
          return;
        }
        const resp = await fetch(backendUrl + "/api/withdrawal/codes", {
          headers: { Authorization: token },
        });
        const data = await resp.json();
        if (data.success) setCodes(data.codes || []);
        else setError(data.message || "Failed to fetch codes");
      } catch (err) {
        console.error(err);
        setError("Error fetching codes");
      } finally {
        setLoading(false);
      }
    };
    fetchCodes();
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Withdrawal Codes</h1>
        {loading ? (
          <p className="text-gray-500">Loading codes...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        ) : codes.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded border border-gray-200">No withdrawal codes found</div>
        ) : (
          <div className="space-y-4">
            {codes.map((c) => (
              <div key={c._id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-lg">{c.code}</h3>
                    <p className="text-sm text-gray-600">Amount withdrawable: {c.amountWithdrawableEth} ETH</p>
                    <p className="text-sm text-gray-500">Paid: {c.amountPaidEth} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Status</p>
                    <p className={`mt-1 font-semibold ${c.status === 'unused' ? 'text-emerald-600' : c.status === 'reserved' ? 'text-amber-600' : 'text-red-600'}`}>{c.status}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Issued: {new Date(c.createdAt).toLocaleString()}</p>
                {c.usedAt && <p className="mt-1 text-xs text-gray-500">Used: {new Date(c.usedAt).toLocaleString()}</p>}
                {c.adminNotes && <p className="mt-1 text-xs text-gray-500">Admin notes: {c.adminNotes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalCodes;
