import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import productService from "../services/productService";
import ProductCard from "../components/products/ProductCard";
import toast from "react-hot-toast";

const categories = [
  {
    name: "Electronics",
    description: "Latest gadgets, smart devices and accessories.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Clothing",
    description: "Trendy apparel for every season.",
    color: "from-pink-500 to-red-500",
  },
  {
    name: "Books",
    description: "Must-read books, guides, and bestsellers.",
    color: "from-yellow-500 to-orange-500",
  },
];

const HomePage = () => {
  const location = useLocation();
  const welcomeMessage = location.state?.welcomeMessage;
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const data = await productService.getProducts({ limit: 6 });
        setFeatured(data || []);
      } catch (err) {
        console.error('Failed to load featured products', err);
        toast.error('Failed to load featured products');
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div>
      {welcomeMessage && (
        <section className="bg-green-50 border border-green-200 text-green-900 px-6 py-4 rounded-xl mx-4 my-6 lg:mx-0">
          <div className="container-custom flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Welcome!</h2>
            <p className="text-sm leading-6">{welcomeMessage}</p>
          </div>
        </section>
      )}
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="container-custom grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm uppercase tracking-widest text-white/80 mb-4">
              Shop smarter, live better
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover quality products from Ethiopia and beyond
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              Explore top categories, fast shipping, and a beautiful shopping
              experience designed to convert visitors into customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-3 rounded-full font-semibold shadow-lg shadow-black/10 hover:bg-gray-100 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 shadow-xl">
              <h3 className="text-2xl font-semibold mb-3">Fast delivery</h3>
              <p className="text-white/80">
                Delivering orders quickly across the region with reliable
                shipping.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 shadow-xl">
              <h3 className="text-2xl font-semibold mb-3">Secure checkout</h3>
              <p className="text-white/80">
                Safe payment, order tracking, and customer support for every
                purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Promotional Banner */}
      <section className="py-6">
        <div className="container-custom">
          <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-white border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Limited time: Summer Sale — up to 40% off</h3>
              <p className="text-gray-600 mt-2">Selected electronics, clothing and home essentials. While stocks last.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/products?category=Electronics" className="btn-primary">Shop Electronics</Link>
              <Link to="/products" className="btn-secondary">See All Deals</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Categories</h2>
              <p className="text-gray-600 mt-2">
                Tap any category to explore curated collections.
              </p>
            </div>
            <Link
              to="/products"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Browse all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-lg shadow-black/10 hover:shadow-2xl transition bg-gradient-to-br ${category.color}`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <span className="text-sm uppercase tracking-[0.3em] text-white opacity-100 drop-shadow-lg">
                    {category.name}
                  </span>
                  <h3 className="text-3xl font-bold my-4 text-white drop-shadow-lg">
                    {category.name}
                  </h3>
                  <p className="max-w-sm text-white/95 leading-relaxed drop-shadow-lg">
                    {category.description}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white drop-shadow-lg">
                    Explore now →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-600 mt-1">Hand-picked popular items</p>
            </div>
            <Link to="/products" className="text-primary-600 font-semibold hover:text-primary-700">View all products →</Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
