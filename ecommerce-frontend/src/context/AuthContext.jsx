import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);

      // Create user object from the response
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || "user",
      };

      setUser(userData);
      return { user: userData, token: data.token };
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      // Don't set user yet - wait for OTP verification
      return data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (otpData) => {
    try {
      const data = await authService.verifyOTP(otpData);

      // Create user object from the response
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || "user",
      };

      setUser(userData);
      return {
        user: userData,
        token: data.token,
        welcomeMessage: data.welcomeMessage,
      };
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (emailData) => {
    try {
      const data = await authService.resendOTP(emailData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "super-admin",
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
