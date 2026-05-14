import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import adminService from "../../services/adminService";
import { useStoreSettings } from "../../context/StoreSettingsContext";
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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("admin");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: "",
    message: "",
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        setUserRole(user?.role || "admin");

        const data = await adminService.getSettings();
        setSettings({
          general: {
            storeName: data.storeName || "E-Store",
            storeEmail: data.storeEmail || "contact@estore.com",
            storePhone: data.storePhone || "+1 (555) 123-4567",
            storeAddress:
              data.storeAddress || "123 Commerce St, New York, NY 10001",
            currency: data.currency || "USD",
            timezone: data.timezone || "America/New_York",
            language: data.language || "en",
          },
          payment: {
            methods: data.paymentMethods || [],
            currency: "USD",
            taxRate: 10,
          },
          shipping: {
            methods: data.shippingMethods || [],
            freeShippingThreshold: 100,
            internationalShipping: false,
          },
          email: data.emailSettings || {},
          security: data.securitySettings || {},
        });

        // Fetch admins if user is super-admin
        if (user?.role === "super-admin") {
          try {
            const adminsData = await adminService.getAdmins();
            setAdmins(Array.isArray(adminsData) ? adminsData : []);
          } catch (error) {
            console.error("Failed to fetch admins:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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
    { id: "broadcast", name: "Broadcast", icon: FiBell },
    ...(userRole === "super-admin"
      ? [{ id: "admins", name: "Admins", icon: FiShield }]
      : []),
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

  const { updateStoreSettings } = useStoreSettings();

  const handleSave = async () => {
    if (userRole !== "super-admin") {
      toast.error("Only super-admin can modify settings");
      return;
    }

    setSaving(true);
    try {
      const settingsData = {
        storeName: settings.general.storeName,
        storeEmail: settings.general.storeEmail,
        storePhone: settings.general.storePhone,
        storeAddress: settings.general.storeAddress,
        currency: settings.general.currency,
        timezone: settings.general.timezone,
        language: settings.general.language,
        paymentMethods: settings.payment.methods,
        shippingMethods: settings.shipping.methods,
        emailSettings: settings.email,
        securitySettings: settings.security,
      };

      await adminService.updateSettings(settingsData);
      toast.success("Settings saved successfully");
      updateStoreSettings({
        storeName: settings.general.storeName,
        storeEmail: settings.general.storeEmail,
        storePhone: settings.general.storePhone,
        storeAddress: settings.general.storeAddress,
        currency: settings.general.currency,
        timezone: settings.general.timezone,
        language: settings.general.language,
      });
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendBroadcastEmail = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject.trim() || !broadcastData.message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    try {
      setSendingBroadcast(true);
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      toast.error("Name, email, and password are required");
      return;
    }

    try {
      setCreatingAdmin(true);
      await adminService.createAdmin(newAdminData);
      toast.success("Admin created successfully!");
      setNewAdminData({ name: "", email: "", password: "", phone: "" });
      setShowCreateAdminModal(false);
      const adminsData = await adminService.getAdmins();
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin({
      ...admin,
      password: "",
    });
    setShowEditAdminModal(true);
  };

  const handleSaveAdminUpdate = async (e) => {
    e.preventDefault();
    if (!editingAdmin?.name || !editingAdmin?.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setUpdatingAdmin(true);
      await adminService.updateAdmin(editingAdmin.id, {
        name: editingAdmin.name,
        email: editingAdmin.email,
        phone: editingAdmin.phone,
        role: editingAdmin.role,
        ...(editingAdmin.password ? { password: editingAdmin.password } : {}),
      });
      toast.success("Admin updated successfully!");
      setShowEditAdminModal(false);
      setEditingAdmin(null);
      const adminsData = await adminService.getAdmins();
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update admin");
    } finally {
      setUpdatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      await adminService.deleteAdmin(adminId);
      toast.success("Admin deleted successfully!");
      const adminsData = await adminService.getAdmins();
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
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
          </div>
        );

      case "broadcast":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Broadcast Email</h3>
            <p className="text-sm text-gray-600">
              Send an email announcement to all registered users.
            </p>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FiBell className="h-4 w-4" />
                Open Broadcast Email Form
              </button>
            </div>
          </div>
        );

      case "admins":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Admin Management</h3>
              <button
                onClick={() => setShowCreateAdminModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FiShield className="h-4 w-4" />
                Create Admin
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Manage admin accounts for your store.
            </p>

            <div className="space-y-4">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      {admin.phone && (
                        <p className="text-sm text-gray-400">{admin.phone}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        disabled={admin.role === 'super-admin'}
                        className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No admins created yet
                </p>
              )}
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
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Role Warning */}
              {userRole !== "super-admin" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You are logged in as a regular admin.
                    Only super-admins can modify settings.
                  </p>
                </div>
              )}

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
                  disabled={saving || userRole !== "super-admin"}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="h-4 w-4" />
                  {saving
                    ? "Saving..."
                    : userRole !== "super-admin"
                      ? "No Permission"
                      : "Save Changes"}
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
                <h2 className="text-lg font-bold text-red-800 mb-4">
                  Danger Zone
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">
                        Export Store Data
                      </p>
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
            </>
          )}
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

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Admin</h2>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      name: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Admin name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      email: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      password: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newAdminData.phone}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      phone: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditAdminModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Admin</h2>
              <button
                onClick={() => {
                  setShowEditAdminModal(false);
                  setEditingAdmin(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editingAdmin.name}
                  onChange={(e) =>
                    setEditingAdmin({ ...editingAdmin, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingAdmin.email}
                  onChange={(e) =>
                    setEditingAdmin({ ...editingAdmin, email: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingAdmin.phone || ""}
                  onChange={(e) =>
                    setEditingAdmin({ ...editingAdmin, phone: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editingAdmin.password}
                  onChange={(e) =>
                    setEditingAdmin({ ...editingAdmin, password: e.target.value })
                  }
                  className="input-field"
                  placeholder="New password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editingAdmin.role}
                  onChange={(e) =>
                    setEditingAdmin({ ...editingAdmin, role: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAdminModal(false);
                    setEditingAdmin(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingAdmin}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {updatingAdmin ? "Updating..." : "Save Changes"}
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
