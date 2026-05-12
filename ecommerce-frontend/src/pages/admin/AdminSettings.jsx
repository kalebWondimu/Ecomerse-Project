import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  FiSave,
  FiCreditCard,
  FiTruck,
  FiMail,
  FiLock,
  FiGlobe,
  FiDollarSign,
  FiPercent,
  FiPackage,
  FiBell,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: "",
    message: "",
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Store settings
  const [settings, setSettings] = useState({
    general: {
      storeName: "E-Store",
      storeEmail: "contact@estore.com",
      storePhone: "+1 (555) 123-4567",
      storeAddress: "123 Commerce St, New York, NY 10001",
      currency: "USD",
      timezone: "America/New_York",
      language: "en",
    },
    payment: {
      methods: [
        { id: "stripe", name: "Stripe", enabled: true, testMode: true },
        { id: "paypal", name: "PayPal", enabled: true, testMode: true },
        {
          id: "cod",
          name: "Cash on Delivery",
          enabled: false,
          testMode: false,
        },
      ],
      stripePublicKey: "pk_test_...",
      stripeSecretKey: "sk_test_...",
      paypalClientId: "AYx...",
      currency: "USD",
      taxRate: 10,
    },
    shipping: {
      methods: [
        {
          id: "standard",
          name: "Standard Shipping",
          price: 5.99,
          days: "5-7",
          enabled: true,
        },
        {
          id: "express",
          name: "Express Shipping",
          price: 14.99,
          days: "2-3",
          enabled: true,
        },
        {
          id: "overnight",
          name: "Overnight Shipping",
          price: 24.99,
          days: "1",
          enabled: false,
        },
      ],
      freeShippingThreshold: 100,
      internationalShipping: false,
      shippingZones: [{ name: "Domestic", countries: ["US"], price: 5.99 }],
    },
    email: {
      orderConfirmation: true,
      shippingConfirmation: true,
      passwordReset: true,
      welcomeEmail: true,
      newsletterEnabled: true,
      adminNotifications: true,
      lowStockAlerts: true,
      emailSignature: "The E-Store Team",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      ipWhitelist: [],
    },
  });

  const tabs = [
    { id: "general", name: "General", icon: FiGlobe },
    { id: "payment", name: "Payment", icon: FiCreditCard },
    { id: "shipping", name: "Shipping", icon: FiTruck },
    { id: "email", name: "Email", icon: FiMail },
    { id: "security", name: "Security", icon: FiLock },
  ];

  const handleGeneralChange = (e) => {
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handlePaymentToggle = (methodId) => {
    setSettings({
      ...settings,
      payment: {
        ...settings.payment,
        methods: settings.payment.methods.map((method) =>
          method.id === methodId
            ? { ...method, enabled: !method.enabled }
            : method,
        ),
      },
    });
  };

  const handleShippingToggle = (methodId) => {
    setSettings({
      ...settings,
      shipping: {
        ...settings.shipping,
        methods: settings.shipping.methods.map((method) =>
          method.id === methodId
            ? { ...method, enabled: !method.enabled }
            : method,
        ),
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  const handleSendBroadcastEmail = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject.trim() || !broadcastData.message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    try {
      setSendingBroadcast(true);
      // eslint-disable-next-line global-require
      const adminService = require("../../services/adminService").default;
      await adminService.sendBroadcastEmail(
        broadcastData.subject,
        broadcastData.message,
      );
      toast.success("Broadcast email sent successfully to all users!");
      setBroadcastData({ subject: "", message: "" });
      setShowBroadcastModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send broadcast email",
      );
    } finally {
      setSendingBroadcast(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">General Settings</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.general.storeName}
                  onChange={handleGeneralChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Email
                </label>
                <input
                  type="email"
                  name="storeEmail"
                  value={settings.general.storeEmail}
                  onChange={handleGeneralChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Phone
                </label>
                <input
                  type="tel"
                  name="storePhone"
                  value={settings.general.storePhone}
                  onChange={handleGeneralChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>
                <input
                  type="text"
                  name="storeAddress"
                  value={settings.general.storeAddress}
                  onChange={handleGeneralChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.general.currency}
                  onChange={handleGeneralChange}
                  className="input-field"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={settings.general.timezone}
                  onChange={handleGeneralChange}
                  className="input-field"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Payment Settings</h3>

            <div className="space-y-4">
              <h4 className="font-medium">Payment Methods</h4>
              {settings.payment.methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      {method.testMode && (
                        <span className="text-xs text-yellow-600">
                          Test Mode
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => handlePaymentToggle(method.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.payment.taxRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        taxRate: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Shipping Settings</h3>

            <div className="space-y-4">
              <h4 className="font-medium">Shipping Methods</h4>
              {settings.shipping.methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-500">
                      ${method.price} • {method.days} days
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => handleShippingToggle(method.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: {
                        ...settings.shipping,
                        freeShippingThreshold: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Email Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.email).map(
                ([key, value]) =>
                  typeof value === "boolean" && (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() =>
                            setSettings({
                              ...settings,
                              email: { ...settings.email, [key]: !value },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ),
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Signature
              </label>
              <textarea
                value={settings.email.emailSignature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      emailSignature: e.target.value,
                    },
                  })
                }
                rows="3"
                className="input-field"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">
                Broadcast Email to All Users
              </h3>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FiBell className="h-4 w-4" />
                Send Broadcast Email
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Security Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: parseInt(e.target.value),
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        maxLoginAttempts: parseInt(e.target.value),
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        passwordMinLength: parseInt(e.target.value),
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactorAuth: !settings.security.twoFactorAuth,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-gray-500">
                    Require email verification for new accounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.requireEmailVerification}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          requireEmailVerification:
                            !settings.security.requireEmailVerification,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">Configure your store settings</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Settings Navigation */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                        ${
                          activeTab === tab.id
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">{renderTabContent()}</div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
            <h2 className="text-lg font-bold text-red-800 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-800">Export Store Data</p>
                  <p className="text-sm text-red-600">
                    Download all your store data as JSON
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Export Data
                </button>
              </div>
              <div className="border-t border-red-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Delete Store</p>
                    <p className="text-sm text-red-600">
                      Permanently delete your store and all data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Email Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Send Broadcast Email</h2>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcastEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) =>
                    setBroadcastData({
                      ...broadcastData,
                      subject: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="e.g., Seasonal Sale - 50% Off Everything!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={broadcastData.message}
                  onChange={(e) =>
                    setBroadcastData({
                      ...broadcastData,
                      message: e.target.value,
                    })
                  }
                  rows="6"
                  className="input-field"
                  placeholder="Write your message here. You can use multiple lines."
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This email will be sent to{" "}
                  <strong>all registered users</strong> in the system. Make sure
                  your message is relevant and valuable to your audience.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {sendingBroadcast ? "Sending..." : "Send to All Users"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
