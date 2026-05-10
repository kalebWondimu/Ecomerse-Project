import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: "/admin", icon: FiHome, label: "Dashboard" },
    { path: "/admin/products", icon: FiPackage, label: "Products" },
    { path: "/admin/orders", icon: FiShoppingBag, label: "Orders" },
    { path: "/admin/users", icon: FiUsers, label: "Users" },
    { path: "/admin/analytics", icon: FiBarChart2, label: "Analytics" },
    { path: "/admin/settings", icon: FiSettings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-600">Admin Panel</h2>
        <p className="text-xs text-gray-500 mt-1">Store Management</p>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-600 border-r-4 border-primary-600"
                  : ""
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto absolute bottom-6"
        >
          <FiLogOut className="h-5 w-5 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
