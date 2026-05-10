import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiCreditCard,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CartPage = () => {
  const {
    cart,
    loading,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    initialized,
  } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {}, [cart]);

  // Handle authentication check
  useEffect(() => {
    if (!authLoading && initialized) {
      if (!isAuthenticated) {
        setRedirecting(true);
        navigate("/login");
      } else {
        refreshCart();
      }
    }
  }, [isAuthenticated, authLoading, initialized, navigate, refreshCart]);

  // Show loading while checking auth
  if (authLoading || !initialized || redirecting) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything
  if (!isAuthenticated) {
    return null;
  }

  // Show cart loading state
  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-4 rounded-lg">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center"
            >
              <FiShoppingBag className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleQuantityChange = async (productId, newQuantity, currentStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > currentStock) {
      toast.error(`Only ${currentStock} items available`);
      return;
    }
    setUpdating(true);
    await updateQuantity(productId, newQuantity);
    setUpdating(false);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      setUpdating(true);
      await removeFromCart(productId);
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (cart?.items?.length > 0 && window.confirm("Clear your entire cart?")) {
      setUpdating(true);
      await clearCart();
      setUpdating(false);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
        {cart.items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 flex items-center text-sm"
            disabled={updating}
          >
            <FiTrash2 className="mr-1" />
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200"><span class="text-3xl">📦</span></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <span className="text-3xl">📦</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <Link to={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      disabled={updating}
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity - 1,
                            item.stock,
                          )
                        }
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1 || updating}
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity + 1,
                            item.stock,
                          )
                        }
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity >= item.stock || updating}
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="text-xs text-orange-600 mt-2">
                      Only {item.stock} available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="mt-6">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 inline-flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
                  <FiTruck className="inline mr-1" />
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate("/checkout")}
              disabled={cart.items.length === 0 || updating}
              className="w-full btn-primary py-3 mb-4 disabled:opacity-50"
            >
              Proceed to Checkout
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
              <div>
                <FiTruck className="h-4 w-4 mx-auto mb-1" />
                Free Shipping
              </div>
              <div>
                <FiShield className="h-4 w-4 mx-auto mb-1" />
                Secure Payment
              </div>
              <div>
                <FiCreditCard className="h-4 w-4 mx-auto mb-1" />
                Safe Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
