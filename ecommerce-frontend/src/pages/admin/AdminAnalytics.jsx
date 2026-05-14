import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import adminService from "../../services/adminService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month"); // 'week', 'month', 'year'
  const [analytics, setAnalytics] = useState({
    revenue: { total: 0, growth: 0, data: [] },
    orders: { total: 0, growth: 0, data: [] },
    customers: { total: 0, growth: 0, data: [] },
    products: { total: 0, topSelling: [] },
    categoryBreakdown: [],
    dailySales: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [ordersData, usersData, dashboardStats, productsData] =
        await Promise.all([
          adminService.getAllOrders(),
          adminService.getAllUsers(),
          adminService.getDashboardStats(),
          adminService.getAllProducts(),
        ]);

      const orders = Array.isArray(ordersData) ? ordersData : [];
      const users = Array.isArray(usersData) ? usersData : [];
      const products = Array.isArray(productsData) ? productsData : [];

      const now = new Date();
      const days = dateRange === "week" ? 7 : dateRange === "month" ? 30 : 365;
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - days + 1);

      const recentOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= cutoff;
      });

      const orderRevenueByDate = {};
      const topProductsMap = {};
      const categoryRevenue = {};
      let totalRevenue = 0;

      const productMap = products.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});

      recentOrders.forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const orderTotal = order.totalAmount || 0;
        orderRevenueByDate[date] = orderRevenueByDate[date] || {
          revenue: 0,
          orders: 0,
          customers: new Set(),
        };
        orderRevenueByDate[date].revenue += orderTotal;
        orderRevenueByDate[date].orders += 1;
        totalRevenue += orderTotal;

        const customerIdentifier =
          order.userId ||
          order.User?.id ||
          order.user?.id ||
          order.email ||
          order.User?.email;
        if (customerIdentifier) {
          orderRevenueByDate[date].customers.add(customerIdentifier);
        }

        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const productName =
              item.productName || `Product #${item.productId}`;
            const category =
              productMap[item.productId]?.category || "Uncategorized";
            const itemRevenue = (item.quantity || 1) * (item.price || 0);

            if (!topProductsMap[productName]) {
              topProductsMap[productName] = {
                name: productName,
                sales: 0,
                revenue: 0,
              };
            }
            topProductsMap[productName].sales += item.quantity || 1;
            topProductsMap[productName].revenue += itemRevenue;

            categoryRevenue[category] =
              (categoryRevenue[category] || 0) + itemRevenue;
          });
        }
      });

      const revenueData = Object.entries(orderRevenueByDate).map(
        ([date, value]) => ({
          name: date,
          revenue: value.revenue,
          sales: value.revenue,
          orders: value.orders,
          customers: value.customers.size,
        }),
      );

      const topSellingProducts = Object.values(topProductsMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const categoryBreakdown = Object.entries(categoryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const createdToday = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return (
          createdAt >=
          new Date(now.getFullYear(), now.getMonth(), now.getDate())
        );
      }).length;

      setAnalytics({
        revenue: {
          total: totalRevenue,
          growth: 0,
          data: revenueData,
        },
        orders: {
          total: recentOrders.length,
          growth: 0,
          data: revenueData,
        },
        customers: {
          total: users.length,
          growth: 0,
          data: [],
        },
        products: {
          total: dashboardStats?.stats?.totalProducts || 0,
          topSelling: topSellingProducts,
        },
        categoryBreakdown,
        dailySales: revenueData,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      ...analytics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
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
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Track your store's performance and growth
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field w-32"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last 12 months</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <FiRefreshCw className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={downloadReport}
                className="btn-primary flex items-center gap-2"
              >
                <FiDownload className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiDollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <span
                  className={`text-sm font-medium ${analytics.revenue.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {analytics.revenue.growth >= 0 ? "+" : ""}
                  {analytics.revenue.growth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.revenue.total)}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <span
                  className={`text-sm font-medium ${analytics.orders.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {analytics.orders.growth >= 0 ? "+" : ""}
                  {analytics.orders.growth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.orders.total}
              </p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiUsers className="h-5 w-5 text-purple-600" />
                </div>
                <span
                  className={`text-sm font-medium ${analytics.customers.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {analytics.customers.growth >= 0 ? "+" : ""}
                  {analytics.customers.growth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.customers.total}
              </p>
              <p className="text-sm text-gray-500">Total Customers</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiTrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">89.5%</p>
              <p className="text-sm text-gray-500">Conversion Rate</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analytics.dailySales}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="ordersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fill="url(#revenueGradient)"
                  name="Revenue ($)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  fill="url(#ordersGradient)"
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Top Selling Products
              </h2>
              <div className="space-y-4">
                {analytics.products.topSelling.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.sales} units sold
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-primary-600">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Sales Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Daily Sales Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales ($)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.dailySales.slice(-7).map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        {formatCurrency(day.sales || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.orders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.customers || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.orders
                          ? formatCurrency((day.sales || 0) / day.orders)
                          : "$0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
