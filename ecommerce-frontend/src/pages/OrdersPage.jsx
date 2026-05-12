import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import productService from "../services/productService";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiMapPin,
  FiCreditCard,
  FiAlertCircle,
  FiShoppingBag,
} from "react-icons/fi";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await productService.getProductById(productId);
      return response;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);

      const productPromises = [];
      const productsToFetch = {};

      data.forEach((order) => {
        order.items?.forEach((item) => {
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
      });

      await Promise.all(productPromises);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setCancellingId(orderId);
      await orderService.cancelOrder(orderId);

      // Update the order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order,
        ),
      );

      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <FiTruck className="h-5 w-5 text-blue-600" />;
      case "cancelled":
        return <FiXCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: {
        text: "Processing",
        description: "Your order is being prepared",
        color: "bg-orange-100 text-orange-700",
        canCancel: true,
      },
      processing: {
        text: "Processing",
        description: "Your order is being prepared",
        color: "bg-orange-100 text-orange-700",
        canCancel: true,
      },
      shipped: {
        text: "On The Way",
        description: "Your order is on its way",
        color: "bg-blue-100 text-blue-700",
        canCancel: false,
      },
      delivered: {
        text: "Delivered",
        description: "Your order has been delivered",
        color: "bg-green-100 text-green-700",
        canCancel: false,
      },
      cancelled: {
        text: "Cancelled",
        description: "This order has been cancelled",
        color: "bg-red-100 text-red-700",
        canCancel: false,
      },
    };
    return (
      statusMap[status?.toLowerCase()] || {
        ...statusMap.pending,
        canCancel: true,
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      short: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading your order history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center"
            >
              <FiShoppingBag className="mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.length > 0 && [...orders].reverse().map((order) => {
              const status = getStatusDisplay(order.status);
              const date = formatDate(order.createdAt);
              const isCancelling = cancellingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {status.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Order </span>
                        <span className="font-mono font-medium text-primary-600">
                          ORD-{String(order.id).padStart(6, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">{date.full}</div>
                      {status.canCancel && order.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isCancelling}
                          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
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
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => {
                        const product = products[item.productId];
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 py-2"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {product?.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    e.target.parentNode.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center"><span class="text-2xl">📦</span></div>';
                                  }}
                                />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {product?.name || `Product #${item.productId}`}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>Quantity: {item.quantity}</span>
                                <span>Price: ${item.price?.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary-600">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Subtotal: ${(order.totalAmount || 0).toFixed(2)}
                          </span>
                          <span>•</span>
                          <span>Shipping: Calculated at checkout</span>
                        </div>
                        {order.shippingAddress && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiMapPin className="h-4 w-4" />
                            <span className="truncate max-w-md">
                              {order.shippingAddress}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          Total:{" "}
                          <span className="text-primary-600">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <Link
                          to={`/order-confirmation/${order.id}`}
                          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-1 font-medium"
                        >
                          <FiEye className="mr-1" />
                          View Order Details
                        </Link>
                      </div>
                    </div>

                    {/* Cancellation Notice */}
                    {order.status === "cancelled" && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                        <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Order Cancelled
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            This order has been cancelled. If you were charged,
                            please contact support for a refund.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
