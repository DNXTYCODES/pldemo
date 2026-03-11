import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const FundAccount = () => {
  const { navigate, backendUrl, token } = useContext(ShopContext);
  const [ethAmount, setEthAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [currentEthPrice, setCurrentEthPrice] = useState(0);
  const [usdValue, setUsdValue] = useState("0");
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  // Simulated platform deposit address
  const DEPOSIT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc238e8eA63c53";

  // Fetch user's pending deposits
  const fetchUserDeposits = async () => {
    if (!token) return;
    try {
      setLoadingDeposits(true);
      const response = await fetch(
        backendUrl + "/api/deposit/transactions?type=deposit&limit=10",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setDeposits(data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
    } finally {
      setLoadingDeposits(false);
    }
  };

  useEffect(() => {
    // Fetch current ETH price
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          setCurrentEthPrice(data.ethereum.usd);
        } else {
          setCurrentEthPrice(3000);
        }
      } catch (err) {
        console.error("Error fetching ETH price:", err);
        setCurrentEthPrice(3000); // Fallback price
      }
    };

    fetchEthPrice();
  }, []);

  useEffect(() => {
    fetchUserDeposits();
  }, [token]);

  // Calculate USD value when ETH amount changes
  useEffect(() => {
    if (ethAmount && currentEthPrice) {
      const usd = (parseFloat(ethAmount) * currentEthPrice).toFixed(2);
      setUsdValue(usd);
    } else {
      setUsdValue("0");
    }
  }, [ethAmount, currentEthPrice]);

  const handleInitiateDeposit = async () => {
    setError("");
    setSuccess("");

    const ethNum = parseFloat(ethAmount);
    if (!ethAmount || ethNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(backendUrl + "/api/deposit/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ amountEth: ethAmount }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Deposit initiated! Please send ${ethAmount} ETH to the address below.`,
        );
        setEthAmount("");
        // Refresh deposits list
        // In real app, you'd fetch updated deposits here
      } else {
        setError(data.message || "Failed to initiate deposit");
      }
    } catch (err) {
      setError("Error initiating deposit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    alert("Address copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Title text1="Fund Your" text2="Account" />

        <div className="mt-12 space-y-8">
          {/* Step-by-step instructions */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">
              How to Fund Your Account
            </h2>

            <div className="space-y-6">
              {/* Step 1: Enter Amount */}
              <div className="bg-gray-700 rounded p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Enter Amount</h3>
                    <p className="text-gray-300 text-sm">
                      Enter the amount of Ethereum (ETH) you want to deposit
                      into your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Send ETH */}
              <div className="bg-gray-700 rounded p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Send Ethereum
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Send the exact amount of ETH to the address provided below
                      using any Ethereum wallet (MetaMask, Ledger, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Admin Confirmation */}
              <div className="bg-gray-700 rounded p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Admin Confirmation
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Our team will verify the transaction and add funds to your
                      account. You'll receive a notification once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-6">Initiate Deposit</h3>

            {/* ETH Price Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-900 to-gray-700 rounded border border-amber-700">
              <p className="text-sm text-gray-300 mb-2">Current ETH Price</p>
              <p className="text-2xl font-bold text-amber-400">
                ${currentEthPrice.toFixed(2)} USD
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Amount to Deposit (ETH)
              </label>
              <input
                type="number"
                placeholder="Enter amount in ETH"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>

            {/* USD Conversion Display */}
            {ethAmount && (
              <div className="mb-6 p-4 bg-gray-700 rounded border border-gray-600">
                <p className="text-sm text-gray-300">USD Equivalent</p>
                <p className="text-2xl font-bold text-green-400">${usdValue}</p>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded text-green-200">
                {success}
              </div>
            )}

            {/* Initiate Button */}
            <button
              onClick={handleInitiateDeposit}
              disabled={loading || !ethAmount}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors"
            >
              {loading ? "Processing..." : "Initiate Deposit"}
            </button>
          </div>

          {/* Deposit Address */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-6">Deposit Address</h3>
            <p className="text-gray-300 text-sm mb-4">
              Send Ethereum to this address:
            </p>

            <div className="mb-4 p-4 bg-gray-700 rounded border border-amber-600 flex items-center justify-between gap-4">
              <code className="text-amber-400 font-mono text-sm break-all">
                {DEPOSIT_ADDRESS}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded font-medium text-gray-900 flex-shrink-0 whitespace-nowrap"
              >
                Copy
              </button>
            </div>

            <div className="bg-yellow-900 border border-yellow-700 p-4 rounded text-yellow-200 text-sm">
              <p className="font-semibold mb-2">⚠️ Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only send Ethereum (ETH) to this address</li>
                <li>Sending other tokens may result in permanent loss</li>
                <li>Ensure you are on the Ethereum mainnet</li>
                <li>Your deposit will be confirmed within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Recent Deposits */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-6">Pending Deposits</h3>

            {loadingDeposits ? (
              <div className="text-center py-4 text-gray-400">
                Loading deposits...
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No pending deposits at this time
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div
                    key={deposit._id}
                    className="p-4 bg-gray-700 border border-gray-600 rounded flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">
                          {deposit.amountEth} ETH
                        </h4>
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            deposit.status === "pending"
                              ? "bg-yellow-900 text-yellow-200"
                              : deposit.status === "completed"
                                ? "bg-green-900 text-green-200"
                                : "bg-red-900 text-red-200"
                          }`}
                        >
                          {deposit.status === "pending" && "⏳ Pending Review"}
                          {deposit.status === "completed" &&
                            "✅ Confirmed (funds added)"}
                          {deposit.status === "cancelled" && "❌ Rejected"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        ${deposit.amountUsd} USD
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(deposit.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      {deposit.status === "pending" && (
                        <p className="text-xs text-amber-400 mt-2">
                          ⏳ Awaiting admin review. Please send {deposit.amountEth}{" "}
                          ETH to the address above.
                        </p>
                      )}
                      {deposit.status === "completed" && (
                        <p className="text-xs text-green-400 mt-2">
                          ✅ Your deposit was approved by admin on{" "}
                          {new Date(deposit.completedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                      {deposit.status === "cancelled" &&
                        deposit.adminNotes && (
                          <p className="text-xs text-red-400 mt-2">
                            Reason: {deposit.adminNotes}
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundAccount;
