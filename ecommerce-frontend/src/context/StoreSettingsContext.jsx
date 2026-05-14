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
  const [settings, setSettings] = useState({
    storeName: "E-Store",
    storeEmail: "contact@estore.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Commerce St, New York, NY 10001",
    currency: "USD",
    timezone: "America/New_York",
    language: "en",
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
  };

  return (
    <StoreSettingsContext.Provider
      value={{ settings, updateStoreSettings, loading }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};
