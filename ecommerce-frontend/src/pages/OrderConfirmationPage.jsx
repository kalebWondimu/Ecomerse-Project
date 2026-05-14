import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import productService from "../services/productService";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiArrowLeft,
  FiShoppingBag,
  FiXCircle,
  FiMapPin,
  FiCreditCard,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";
import toast from "react-hot-toast";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState({});
  const [isCancelling, setIsCancelling] = useState(false);
  const [hidingOrder, setHidingOrder] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadOrderData = async () => {
      await fetchOrder();
    };

    loadOrderData();
  }, [orderId, isAuthenticated, navigate]);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await productService.getProductById(productId);
      return response;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);

      if (!data || Object.keys(data).length === 0) {
        setError("Order not found");
      } else {
        setOrder(data);

        // Fetch product details for all items
        const productPromises = [];
        const productsToFetch = {};

        data.items?.forEach((item) => {
          if (!products[item.productId] && !productsToFetch[item.productId]) {
            productsToFetch[item.productId] = true;
            productPromises.push(
              fetchProductDetails(item.productId).then((product) => {
                if (product) {
                  setProducts((prev) => ({
                    ...prev,
                    [item.productId]: product,
                  }));
                }
              }),
            );
          }
        });

        await Promise.all(productPromises);
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      setError("Could not load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      await orderService.cancelOrder(order.id);
      toast.success("Order cancelled successfully");
      // Update local state
      setOrder({ ...order, status: "cancelled" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleHideOrderHistory = async () => {
    if (
      !window.confirm(
        "Hide this order from your order history? You can still view it from the order details, but it won't appear in your orders list.",
      )
    ) {
      return;
    }

    try {
      setHidingOrder(true);
      await orderService.hideOrder(order.id);
      toast.success("Order hidden from history");
      // Redirect to orders page
      setTimeout(() => navigate("/orders"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to hide order");
    } finally {
      setHidingOrder(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-100 text-orange-700",
      processing: "bg-orange-100 text-orange-700",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Processing",
      processing: "Processing",
      shipped: "On The Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return texts[status?.toLowerCase()] || status || "Processing";
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: "Your order is being prepared",
      processing: "Your order is being prepared",
      shipped: "Your order is on its way",
      delivered: "Your order has been delivered",
      cancelled: "This order has been cancelled",
    };
    return descriptions[status?.toLowerCase()] || "Processing your order";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading your order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              {error || "We couldn't find the order you're looking for."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/orders" className="btn-primary">
                View My Orders
              </Link>
              <Link to="/products" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = !["shipped", "delivered", "cancelled"].includes(
    order.status?.toLowerCase(),
  );

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <p className="text-gray-600">Order #ORD-{order.id}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
              <p className="text-sm text-gray-500 mt-2">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              {getStatusDescription(order.status)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FiPackage className="mr-2 text-primary-600" /> Items in Your Order
          </h2>

          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => {
                const product = products[item.productId];
                const itemTotal = (item.price * item.quantity).toFixed(2);

                return (
                  <div
                    key={index}
                    className="flex gap-4 py-4 border-b last:border-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {product?.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center"><span class="text-3xl">📦</span></div>';
                          }}
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {product?.name || `Product #${item.productId}`}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Quantity: {item.quantity} × $
                            {item.price?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">
                            ${itemTotal}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No items found in this order
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="max-w-md ml-auto">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiMapPin className="mr-2 text-primary-600" /> Shipping Address
            </h2>
            <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
              {typeof order.shippingAddress === "string"
                ? order.shippingAddress
                : JSON.stringify(order.shippingAddress, null, 2)}
            </p>
          </div>
        )}

        {/* Payment Information */}
        {order.paymentMethod && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiCreditCard className="mr-2 text-primary-600" /> Payment Method
            </h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {order.paymentMethod === "card"
                ? "Credit Card"
                : order.paymentMethod}
              {order.paymentDetails?.last4 &&
                ` ending in ${order.paymentDetails.last4}`}
            </p>
          </div>
        )}

        {/* Cancellation Notice */}
        {order.status?.toLowerCase() === "cancelled" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-start gap-4">
            <FiAlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Order Cancelled
              </h3>
              <p className="text-sm text-red-600">
                This order has been cancelled. If you were charged, please
                contact customer support for a refund.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/products" className="btn-primary flex items-center gap-2">
            <FiShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn-secondary flex items-center gap-2">
            View All Orders
          </Link>
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <FiXCircle className="h-4 w-4" />
                  <span>Cancel Order</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleHideOrderHistory}
            disabled={hidingOrder}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {hidingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Hiding...</span>
              </>
            ) : (
              <>
                <FiEye className="h-4 w-4" />
                <span>Hide from History</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
