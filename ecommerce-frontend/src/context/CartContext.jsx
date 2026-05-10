import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Calculate item count from cart
  const calculateItemCount = useCallback((cart) => {
    if (cart?.items && Array.isArray(cart.items)) {
      const count = cart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0,
      );
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, []);

  // Transform backend cart data to frontend format
  const transformCartData = (backendCart) => {
    if (!backendCart) return { items: [], totalPrice: 0 };

    let transformedItems = [];

    if (backendCart.items && Array.isArray(backendCart.items)) {
      transformedItems = backendCart.items.map((item) => {
        return {
          id: item.productId,
          productId: item.productId,
          name: item.name || "Product",
          price: item.price || 0,
          quantity: item.quantity || 1,
          stock: item.stock || 0,
          category: item.category || "Uncategorized",
          image: item.image || null,
        };
      });
    }

    return {
      ...backendCart,
      items: transformedItems,
      totalPrice: backendCart.totalPrice || 0,
    };
  };

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartData({ items: [], totalPrice: 0 });
      setItemCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      const transformedData = transformCartData(data);
      setCartData(transformedData);
      calculateItemCount(transformedData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartData({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, calculateItemCount]);

  // Initialize cart when auth is ready
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchCart();
      } else {
        setCartData({ items: [], totalPrice: 0 });
        setItemCount(0);
      }
      setInitialized(true);
    }
  }, [isAuthenticated, authLoading, fetchCart]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      const item = {
        productId: product.id,
        quantity,
      };
      const updatedCart = await cartService.addToCart(item);

      const transformedData = transformCartData(updatedCart);
      setCartData(transformedData);
      calculateItemCount(transformedData);
      toast.success(`${product.name} added to cart!`);
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.updateCartItem(productId, quantity);
      const transformedData = transformCartData(updatedCart);
      setCartData(transformedData);
      calculateItemCount(transformedData);
      toast.success("Cart updated!");
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.removeFromCart(productId);
      const transformedData = transformCartData(updatedCart);
      setCartData(transformedData);
      calculateItemCount(transformedData);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCartData({ items: [], totalPrice: 0 });
      setItemCount(0);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart
  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart: cartData,
    loading,
    itemCount,
    initialized,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
