import React, { createContext, useState, useContext, useEffect } from "react";
import adminService from "../services/adminService";

const StoreSettingsContext = createContext();

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error(
      "useStoreSettings must be used within StoreSettingsProvider",
    );
  }
  return context;
};

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const savedStoreName = localStorage.getItem("storeName");
      return {
        storeName: savedStoreName || "E-Store",
        storeEmail: "contact@estore.com",
        storePhone: "+251 911 123 456",
        storeAddress: "Addis Ababa, Ethiopia",
        currency: "ETB",
        timezone: "Africa/Addis_Ababa",
        language: "en",
      };
    } catch {
      return {
        storeName: "E-Store",
        storeEmail: "contact@estore.com",
        storePhone: "+251 911 123 456",
        storeAddress: "Addis Ababa, Ethiopia",
        currency: "ETB",
        timezone: "Africa/Addis_Ababa",
        language: "en",
      };
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await adminService.getPublicSettings();
        setSettings((prev) => ({
          ...prev,
          storeName: data.storeName || prev.storeName,
          storeEmail: data.storeEmail || prev.storeEmail,
          storePhone: data.storePhone || prev.storePhone,
          storeAddress: data.storeAddress || prev.storeAddress,
          currency: data.currency || prev.currency,
          timezone: data.timezone || prev.timezone,
          language: data.language || prev.language,
        }));
        try {
          if (data.storeName) localStorage.setItem("storeName", data.storeName);
        } catch {
          // Ignore storage errors and keep the UI responsive.
        }
      } catch (error) {
        console.error("Failed to load store settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateStoreSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      if (newSettings.storeName)
        localStorage.setItem("storeName", newSettings.storeName);
    } catch {
      // Ignore storage errors and keep the UI responsive.
    }
  };

  return (
    <StoreSettingsContext.Provider
      value={{ settings, updateStoreSettings, loading }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};
