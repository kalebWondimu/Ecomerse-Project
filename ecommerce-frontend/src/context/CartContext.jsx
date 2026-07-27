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

    const mergedItems = new Map();

    if (backendCart.items && Array.isArray(backendCart.items)) {
      backendCart.items.forEach((item) => {
        const productId = item.productId;
        const quantity = Number(item.quantity || 1);

        if (!mergedItems.has(productId)) {
          mergedItems.set(productId, {
            id: productId,
            productId,
            name: item.name || "Product",
            price: item.price || 0,
            quantity,
            stock: item.stock || 0,
            category: item.category || "Uncategorized",
            image: item.image || null,
          });
          return;
        }

        const existingItem = mergedItems.get(productId);
        existingItem.quantity += quantity;
      });
    }

    return {
      ...backendCart,
      items: Array.from(mergedItems.values()),
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

  const showCartToast = (type, message) => {
    const toastId = "cart-action";
    toast.dismiss(toastId);
    if (type === "success") {
      toast.success(message, { id: toastId });
    } else {
      toast.error(message, { id: toastId });
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showCartToast("error", "Please login to add items to cart");
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
      showCartToast("success", `${product.name} added to cart!`);
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      // If server responded with an error, the API interceptor already
      // displayed a toast (e.g. 500 / server error). Only show the generic
      // cart failure toast for network/client errors where no server
      // response is present.
      if (!error.response) {
        showCartToast("error", "Failed to add item to cart");
      }
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
      showCartToast("success", "Cart updated!");
    } catch (error) {
      console.error("Update quantity error:", error);
      showCartToast("error", "Failed to update cart");
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
      showCartToast("success", "Item removed from cart");
    } catch (error) {
      console.error("Remove from cart error:", error);
      showCartToast("error", "Failed to remove item");
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
      showCartToast("success", "Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);
      showCartToast("error", "Failed to clear cart");
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
