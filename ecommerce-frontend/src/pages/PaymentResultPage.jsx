import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import paymentService from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import { useStoreSettings } from "../context/StoreSettingsContext";

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { settings: storeSettings } = useStoreSettings();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(
      location.search || location.hash.split("?")[1] || "",
    );
    const txRef = query.get("tx_ref");
    const foundOrderId = query.get("orderId");
    setOrderId(foundOrderId);

    if (!txRef) {
      setError("No transaction reference provided.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const data = await paymentService.verifyPaymentPublic(txRef);
        setResult({ ...data, orderId: foundOrderId });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not verify payment.",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search, location.hash, isAuthenticated, navigate]);

  useEffect(() => {
    document.title = `${storeSettings.storeName || "Store"} | Payment Status`;
  }, [storeSettings.storeName]);

  const renderStatus = () => {
    if (!result) return null;

    const isSuccess =
      result.chapaStatus === "success" &&
      result.chapaData?.status === "success";

    const amount = result?.amount ?? result?.chapaData?.amount;
    const currency = result?.currency || result?.chapaData?.currency || "ETB";

    return (
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">
          {isSuccess ? "Payment Successful" : "Payment Not Confirmed"}
        </h1>
        <p className="text-gray-700 mb-4">
          Transaction reference:{" "}
          <span className="font-mono">{result.transactionId}</span>
        </p>
        {amount && (
          <p className="text-gray-700 mb-4">
            Amount: {Number(amount).toFixed(2)} {currency}
          </p>
        )}
        <p className="text-gray-700 mb-4">
          Chapa status:{" "}
          <span className="font-semibold">{result.chapaStatus}</span>
        </p>
        {result.chapaData?.status && (
          <p className="text-gray-700 mb-4">
            Payment provider status:{" "}
            <span className="font-semibold">{result.chapaData.status}</span>
          </p>
        )}
        {isSuccess ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-700 mb-6">
            <p className="font-semibold">
              Your payment was confirmed successfully.
            </p>
            <p className="mt-1">
              We have received your payment and your order is now being
              prepared.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
            <p className="font-semibold">Payment could not be confirmed.</p>
            <p className="mt-1">
              No completed order was created for this transaction. Please try
              again or contact support if you believe this is an error.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {orderId && isAuthenticated && (
            <Link
              to={`/order-confirmation/${orderId}`}
              className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
            >
              View Order
            </Link>
          )}
          {orderId && !isAuthenticated && (
            <Link
              to="/login"
              className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
            >
              Login to view order
            </Link>
          )}
          <Link
            to="/"
            className="inline-block rounded border border-gray-300 bg-white px-6 py-3 text-gray-800 hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="rounded-lg bg-white p-8 shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6" />
            <p className="text-gray-700">Verifying payment, please wait...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-white p-8 shadow-md text-center">
            <h1 className="text-3xl font-bold mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/"
                className="inline-block rounded border border-gray-300 bg-white px-6 py-3 text-gray-800 hover:bg-gray-50"
              >
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          renderStatus()
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
