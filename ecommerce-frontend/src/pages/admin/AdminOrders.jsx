import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import adminService from "../../services/adminService";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiChevronDown,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiClock,
  FiDownload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedId =
      location.state?.selectedOrderId || queryParams.get("orderId");

    if (selectedId && orders.length > 0) {
      const order = orders.find(
        (o) => o.id?.toString() === selectedId?.toString(),
      );
      if (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.search, orders, navigate, location.pathname]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await adminService.updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success(`Order #ORD-${orderId} status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <FiTruck className="h-5 w-5 text-blue-600" />;
      case "processing":
        return <FiPackage className="h-5 w-5 text-orange-500" />;
      case "cancelled":
        return <FiXCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const getDateRange = (value) => {
    const now = new Date();
    const start = new Date(now);
    switch (value) {
      case "today":
        start.setHours(0, 0, 0, 0);
        return start;
      case "week":
        start.setDate(now.getDate() - 6);
        return start;
      case "month":
        start.setMonth(now.getMonth() - 1);
        return start;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        return start;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const start = getDateRange(dateFilter);
      if (!start) return true;
      const orderDate = new Date(order.createdAt);
      return orderDate >= start;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const getStatusOptions = (currentStatus) => {
    const current = currentStatus?.toLowerCase();
    const allStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const allowedTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    return allStatuses.filter(
      (s) => s !== current && allowedTransitions[current]?.includes(s),
    );
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const exportOrders = () => {
    const csv = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Amount",
        "Status",
        "Date",
        "Items",
      ].join(","),
      ...filteredOrders.map((order) =>
        [
          order.id,
          order.user?.name || "N/A",
          order.user?.email || "N/A",
          order.totalAmount,
          order.status,
          new Date(order.createdAt).toLocaleDateString(),
          order.items?.length || 0,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">
                Manage and track all customer orders
              </p>
            </div>
            <button
              onClick={exportOrders}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <FiDownload className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Export CSV</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.user?.name || order.User?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email || order.User?.email || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">
                            User ID: {order.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <select
                              key={`status-${order.id}-${order.status}`}
                              defaultValue={order.status || "pending"}
                              onChange={(e) =>
                                handleStatusUpdate(order.id, e.target.value)
                              }
                              disabled={updatingStatus}
                              className={`text-xs rounded-full px-2 py-1 border-0 ${getStatusColor(order.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          >
                            <FiEye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-gray-500">
                Showing {Math.min(pageSize, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {getVisiblePages().map((page, index) =>
                  page === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-2 text-sm transition ${currentPage === page ? "bg-primary-600 text-white shadow-sm" : "border border-slate-300 text-slate-700 hover:border-primary-500 hover:text-primary-600"}`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Order #ORD-{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p className="text-sm">
                  Name:{" "}
                  {selectedOrder.user?.name ||
                    selectedOrder.User?.name ||
                    "N/A"}
                </p>
                <p className="text-sm">
                  Email:{" "}
                  {selectedOrder.user?.email ||
                    selectedOrder.User?.email ||
                    "N/A"}
                </p>
                <p className="text-sm">
                  Phone:{" "}
                  {selectedOrder.user?.phone ||
                    selectedOrder.User?.phone ||
                    "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  User ID: {selectedOrder.userId}
                </p>
              </div>
              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="text-sm whitespace-pre-line">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              )}
              {/* Order Items */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {item.productName || `Product #${item.productId}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <p className="font-bold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Status Update */}
              <div className="mt-4 flex gap-2">
                <select
                  value={selectedOrder.status || "pending"}
                  onChange={(e) =>
                    handleStatusUpdate(selectedOrder.id, e.target.value)
                  }
                  disabled={getStatusOptions(selectedOrder.status).length === 0}
                  className="input-field flex-1"
                >
                  {getStatusOptions(selectedOrder.status).length > 0 ? (
                    getStatusOptions(selectedOrder.status).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option value={selectedOrder.status || "pending"}>
                      {selectedOrder.status
                        ? selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)
                        : "Pending"}
                    </option>
                  )}
                </select>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
