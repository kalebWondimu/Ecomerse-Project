import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import paymentService from "../services/paymentService";
import { useAuth } from "../context/AuthContext";

const PaymentResultPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const txRef = query.get("tx_ref");
    const orderId = query.get("orderId");

    if (!txRef) {
      setError("No transaction reference provided.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const data = await paymentService.verifyPaymentPublic(txRef);
        setResult({ ...data, orderId });
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
  }, [location.search]);

  const renderStatus = () => {
    if (!result) return null;

    const isSuccess =
      result.chapaStatus === "success" &&
      result.chapaData?.status === "success";

    return (
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">
          {isSuccess ? "Payment Successful" : "Payment Not Confirmed"}
        </h1>
        <p className="text-gray-700 mb-4">
          Transaction reference:{" "}
          <span className="font-mono">{result.transactionId}</span>
        </p>
        {result.chapaData?.amount && (
          <p className="text-gray-700 mb-4">
            Amount: {result.chapaData.amount} {result.chapaData.currency}
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
