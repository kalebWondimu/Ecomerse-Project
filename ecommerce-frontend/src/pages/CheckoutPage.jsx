import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import toast from "react-hot-toast";
import {
  FiTruck,
  FiCreditCard,
  FiCheckCircle,
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiUser,
  FiMail,
  FiPackage,
  FiShield,
} from "react-icons/fi";

const CheckoutPage = () => {
  const { cart, loading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [hasShownEmptyToast, setHasShownEmptyToast] = useState(false);
  const emptyCheckDone = useRef(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  s;
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!orderPlaced && !loading && cart) {
      if (!cart.items || cart.items.length === 0) {
        if (!emptyCheckDone.current) {
          emptyCheckDone.current = true;
          toast.error("Your cart is empty");
          navigate("/cart");
        }
      }
    }
  }, [isAuthenticated, cart, loading, navigate, orderPlaced]);

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.fullName) newErrors.fullName = "Full name is required";
    if (!shippingInfo.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email))
      newErrors.email = "Email is invalid";
    if (!shippingInfo.phone) newErrors.phone = "Phone number is required";
    if (!shippingInfo.address) newErrors.address = "Address is required";
    if (!shippingInfo.city) newErrors.city = "City is required";
    if (!shippingInfo.state) newErrors.state = "State is required";
    if (!shippingInfo.zipCode) newErrors.zipCode = "Zip code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (!paymentInfo.cardNumber)
      newErrors.cardNumber = "Card number is required";
    else if (paymentInfo.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!paymentInfo.cardName) newErrors.cardName = "Name on card is required";
    if (!paymentInfo.expiry) newErrors.expiry = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) {
      newErrors.expiry = "Expiry must be MM/YY";
    }
    if (!paymentInfo.cvv) newErrors.cvv = "CVV is required";
    else if (paymentInfo.cvv.length < 3) newErrors.cvv = "CVV must be 3 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep(2);
      setErrors({});
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    try {
      setProcessing(true);

      // Format shipping address as a single string
      const shippingAddressString = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;

      const orderData = {
        paymentMethod: "card",
        shippingAddress: shippingAddressString,
      };
      const response = await orderService.createOrder(orderData);
      const newOrderId = response.id;

      setOrderPlaced(true);
      await clearCart();
      toast.success("Order placed successfully!");

      navigate(`/order-confirmation/${newOrderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
      setProcessing(false);
    }
  };

  if (!orderPlaced && (!cart?.items || cart.items.length === 0)) {
    return null;
  }

  const calculateSubtotal = () => {
    return (
      cart?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ) || 0
    );
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 2 ? "bg-primary-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 3 ? "bg-primary-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-primary-600 font-medium">Shipping</span>
          <span
            className={
              currentStep >= 2
                ? "text-primary-600 font-medium"
                : "text-gray-500"
            }
          >
            Payment
          </span>
          <span
            className={
              currentStep >= 3
                ? "text-primary-600 font-medium"
                : "text-gray-500"
            }
          >
            Confirmation
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Main Content - Forms */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {currentStep === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {/* Shipping form fields - keep as before */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={shippingInfo.fullName}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              fullName: e.target.value,
                            })
                          }
                          className={`input-field pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              email: e.target.value,
                            })
                          }
                          className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            phone: e.target.value,
                          })
                        }
                        className={`input-field pl-10 ${errors.phone ? "border-red-500" : ""}`}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            address: e.target.value,
                          })
                        }
                        className={`input-field pl-10 ${errors.address ? "border-red-500" : ""}`}
                        placeholder="123 Main St"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            city: e.target.value,
                          })
                        }
                        className={`input-field ${errors.city ? "border-red-500" : ""}`}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            state: e.target.value,
                          })
                        }
                        className={`input-field ${errors.state ? "border-red-500" : ""}`}
                        placeholder="NY"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            zipCode: e.target.value,
                          })
                        }
                        className={`input-field ${errors.zipCode ? "border-red-500" : ""}`}
                        placeholder="10001"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                      <FiArrowLeft className="mr-2" /> Back to Cart
                    </button>
                    <button type="submit" className="btn-primary">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-4 flex items-center">
                      <FiCreditCard className="mr-2" /> Card Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16);
                            const formatted = val.replace(
                              /(\d{4})(?=\d)/g,
                              "$1 ",
                            );
                            setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: formatted,
                            });
                          }}
                          className={`input-field ${errors.cardNumber ? "border-red-500" : ""}`}
                          placeholder="4242 4242 4242 4242"
                          maxLength="19"
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardName}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardName: e.target.value,
                            })
                          }
                          className={`input-field ${errors.cardName ? "border-red-500" : ""}`}
                          placeholder="John Doe"
                        />
                        {errors.cardName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.cardName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 2) {
                                val = val.slice(0, 2) + "/" + val.slice(2, 4);
                              }
                              setPaymentInfo({ ...paymentInfo, expiry: val });
                            }}
                            className={`input-field ${errors.expiry ? "border-red-500" : ""}`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.expiry && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.expiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 3);
                              setPaymentInfo({ ...paymentInfo, cvv: val });
                            }}
                            className={`input-field ${errors.cvv ? "border-red-500" : ""}`}
                            placeholder="123"
                            maxLength="3"
                          />
                          {errors.cvv && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-lg flex items-start">
                    <FiShield className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>
                      This is a demo store. No real payments will be processed.
                      Use any test card number (e.g., 4242 4242 4242 4242).
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                      <FiArrowLeft className="mr-2" /> Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-primary disabled:opacity-50"
                    >
                      {processing ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
              {cart?.items.map((item) => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <FiPackage className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping to */}
            {currentStep > 1 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <FiTruck className="mr-2" /> Shipping to
                </h3>
                <p className="text-sm text-gray-600">
                  {shippingInfo.fullName}
                  <br />
                  {shippingInfo.address}
                  <br />
                  {shippingInfo.city}, {shippingInfo.state}{" "}
                  {shippingInfo.zipCode}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
