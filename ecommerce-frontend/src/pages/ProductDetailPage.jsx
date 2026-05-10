import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductReviews from "../components/products/ProductReviews";
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
  FiTruck,
  FiRefreshCw,
  FiArrowLeft,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import productService from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);

      // Fetch related products (same category)
      const related = await productService.getProducts({
        category: data.category,
        limit: 4,
      });
      setRelatedProducts(related.filter((p) => p.id !== parseInt(id)));
    } catch (error) {
      toast.error("Failed to load product details");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const success = await addToCart(product, quantity);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increment" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Get the first image from the images array
  const productImage =
    product.images && product.images.length > 0
      ? product.images[selectedImage]
      : null;

  return (
    <div className="container-custom py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <FiArrowLeft className="mr-2" /> Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="relative h-96 flex items-center justify-center">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/500?text=Product";
                  }}
                />
              ) : (
                <div className="text-9xl">📦</div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                  <span className="bg-red-500 text-white px-6 py-3 rounded-full text-xl font-bold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail images - if there are multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category */}
          <div className="mb-4">
            <Link
              to={`/products?category=${product.category}`}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {product.category || "Uncategorized"}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={
                    star <= (product.averageRating || 0) ? "fill-current" : ""
                  }
                />
              ))}
            </div>
            <span className="text-gray-500 ml-2">
              ({product.ratings?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-primary-600">
              ${product.price}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                Out of Stock
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange("decrement")}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiMinus />
                </button>
                <span className="px-6 py-2 border-t border-b border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increment")}
                  disabled={quantity >= product.stock}
                  className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                product.stock > 0
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FiShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>

            <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">
              <FiHeart className="h-5 w-5" />
            </button>

            <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">
              <FiShare2 className="h-5 w-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <FiTruck className="text-primary-600 h-5 w-5" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <FiRefreshCw className="text-primary-600 h-5 w-5" />
              <span className="text-sm">30 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => {
              const relatedImage =
                related.images && related.images.length > 0
                  ? related.images[0]
                  : null;

              return (
                <Link
                  key={related.id}
                  to={`/products/${related.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4"
                >
                  <div className="h-32 flex items-center justify-center mb-2">
                    {relatedImage ? (
                      <img
                        src={relatedImage}
                        alt={related.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary-600">
                    {related.name}
                  </h3>
                  <p className="text-primary-600 font-bold">${related.price}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
