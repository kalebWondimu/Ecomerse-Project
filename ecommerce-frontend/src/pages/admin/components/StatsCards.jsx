import React from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
} from "react-icons/fi";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: FiDollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: "bg-purple-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div
              className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
            >
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">vs last month</span>
            <span className="text-xs text-green-600 ml-2">↑ 12%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
