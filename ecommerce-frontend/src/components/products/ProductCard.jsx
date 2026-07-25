import React from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import OptimizedImage from "../common/OptimizedImage";
import toast from "react-hot-toast";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import {
  convertCurrency,
  formatCurrency,
  normalizeCurrencyCode,
} from "../../utils/currency";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { settings: storeSettings } = useStoreSettings();
  const rating = Number(product.averageRating || 0);
  const displayCurrency = normalizeCurrencyCode(storeSettings?.currency);
  const displayPrice = convertCurrency(
    product.price,
    product.currency || displayCurrency,
    displayCurrency,
  );
  const reviewCount = Number(
    product.reviewCount ?? product.ratings?.length ?? 0,
  );
  const isTopRated = rating >= 4.5 && reviewCount > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    await addToCart(product, 1);
  };

  // Get the first image from the images array
  const productImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.4)]">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-56 overflow-hidden bg-slate-100">
          {productImage ? (
            <OptimizedImage
              src={productImage}
              alt={product.name}
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-6xl">📦</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

          {isTopRated && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Top Rated
            </span>
          )}

          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-slate-900 transition-colors hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {product.description}
        </p>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={star <= Math.round(rating) ? "fill-current" : ""}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-600">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-slate-400">
            ({reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(displayPrice, displayCurrency)}
          </span>
          <button
            onClick={handleAddToCart}
            className={`rounded-xl p-2.5 transition-colors ${
              product.stock > 0
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
            disabled={product.stock === 0}
          >
            <FiShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
