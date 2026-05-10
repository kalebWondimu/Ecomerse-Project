import React from "react";
import { FiPackage } from "react-icons/fi";

const TopProducts = ({ products }) => {
  const topProducts = products || [
    { name: "MacBook Pro", sales: 45, revenue: 112499.55, image: null },
    { name: "Sony Headphones", sales: 38, revenue: 13299.62, image: null },
    { name: "iPad Pro", sales: 32, revenue: 41599.68, image: null },
    { name: "Nike Air Max", sales: 28, revenue: 3639.72, image: null },
    { name: "Atomic Habits", sales: 25, revenue: 499.75, image: null },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FiPackage className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-gray-500">
                {product.sales} units sold
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary-600">
                ${product.revenue?.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
