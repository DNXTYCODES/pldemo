import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";

const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
};

const Withdraw = () => {
  const { navigate, backendUrl, ethPrice } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to request a withdrawal.");
          setLoading(false);
          return;
        }

        const response = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile information.");
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setError(data.message || "Unable to load account information.");
        }
      } catch (err) {
        console.error(err);
        setError("Could not fetch account details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [backendUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!recipientAddress.trim()) {
      setFormError("Please enter a valid ETH address.");
      return;
    }
    if (!isValidEthAddress(recipientAddress)) {
      setFormError("Please enter a valid 42-character ETH address.");
      return;
    }

    const requestedAmount = parseFloat(amount);
    const availableBalance = parseFloat(user?.balance || 0);

    if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
      setFormError("Please enter a valid withdrawal amount greater than 0.");
      return;
    }

    if (requestedAmount > availableBalance) {
      setFormError("Withdrawal amount cannot exceed your available balance.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowConfirmModal(true);
    }, 400);
  };

  const availableBalance = parseFloat(user?.balance || 0);
  const amountNumber = parseFloat(amount || 0);
  const remainingBalance =
    availableBalance - (Number.isFinite(amountNumber) ? amountNumber : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-20 px-4">
        <p className="text-gray-600 text-lg">Loading withdrawal details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900 mb-4">
            Withdraw Funds
          </h1>
          <p className="text-gray-600 mb-6">
            You need to sign in before you can submit a withdrawal request.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 py-3 text-white font-semibold shadow-lg hover:bg-amber-400 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-500">
                Withdrawal Center
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Request a Withdrawal
              </h1>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Enter your destination ETH address and request any amount up to
                your available balance. We’ll review the request and send funds
                to your wallet address once approved.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Back to Profile
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950/95 p-6 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Available Balance
              </p>
              <p className="mt-4 text-5xl font-semibold text-amber-300">
                {getFormattedPrice(availableBalance, ethPrice, "eth")}
              </p>
              <p className="mt-2 text-sm text-slate-400">ETH</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                USD Equivalent
              </p>
              <p className="mt-4 text-4xl font-semibold text-emerald-600">
                {getFormattedPrice(availableBalance, ethPrice, "usd")}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Using current ETH market rate
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-200">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Withdrawal Request
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Complete your request
              </h2>
              <p className="mt-3 text-gray-600">
                Please provide the ETH address where you want the funds to be
                sent. Amounts larger than your available balance are not
                allowed.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Destination ETH Address
                </label>
                <input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x1234..."
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Withdrawal Amount (ETH)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.0001"
                  placeholder="Enter amount up to your balance"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Remaining balance after request:{" "}
                  <span className="font-semibold text-slate-900">
                    {amount
                      ? getFormattedPrice(
                          Math.max(availableBalance - amountNumber, 0),
                          ethPrice,
                          "eth",
                        )
                      : getFormattedPrice(availableBalance, ethPrice, "eth")}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Withdrawal Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Optional note for your request"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-amber-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending request..." : "Request Withdrawal"}
              </button>
            </form>
          </section>

          <aside className="rounded-[2rem] bg-slate-950/95 p-8 text-white shadow-xl border border-slate-900">
            <h3 className="text-2xl font-semibold text-amber-300">
              Withdrawal Guidelines
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li>
                <span className="font-medium text-white">Maximum request:</span>{" "}
                cannot exceed your current available ETH balance.
              </li>
              <li>
                <span className="font-medium text-white">Processing time:</span>{" "}
                withdrawal requests are reviewed within 24-48 hours.
              </li>
              <li>
                <span className="font-medium text-white">
                  Destination wallet:
                </span>{" "}
                make sure you provide a correct Ethereum address.
              </li>
              <li>
                <span className="font-medium text-white">Review status:</span>{" "}
                you can check the request details in your transaction history
                after submission.
              </li>
            </ul>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Summary
              </p>
              <p className="mt-4 text-lg font-semibold text-white">
                Balance available
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-300">
                {getFormattedPrice(availableBalance, ethPrice, "eth")}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {getFormattedPrice(availableBalance, ethPrice, "usd")}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-slate-900">
              Withdrawal Request Sent
            </h2>
            <p className="mt-4 text-slate-600">
              Your withdrawal request has been submitted successfully. Our team
              will review it and process the transfer shortly.
            </p>
            <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Amount
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {getFormattedPrice(amountNumber, ethPrice, "eth")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Destination
                </p>
                <p className="mt-1 text-sm text-slate-900 break-all">
                  {recipientAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowConfirmModal(false);
                setRecipientAddress("");
                setAmount("");
                setNote("");
              }}
              className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-amber-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-amber-400"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
