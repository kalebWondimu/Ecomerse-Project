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
  const [liveUsers, setLiveUsers] = useState(128);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const payload = await productService.getProducts({
          limit: 6,
          sort: "popular",
        });

        const products = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
            ? payload
            : [];

        setFeatured(products.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured products", err);
        setFeatured([]);
        toast.error("Failed to load featured products");
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeatured();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveUsers((prev) => prev + 1);
    }, 7000);

    return () => window.clearInterval(interval);
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 py-16 text-white sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_32%)]" />
        <div className="container-custom relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/80">
              Shop smarter, live better
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Discover quality products from Ethiopia and beyond
            </h1>
            <p className="mb-8 max-w-2xl text-base text-white/80 sm:text-lg">
              Explore top categories, fast shipping, and a beautifully curated
              shopping experience designed to feel as premium as it is
              practical.
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                <span className="text-amber-300">★</span>
                Trusted by 1k+ shoppers
              </div>
            </div>
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>{liveUsers}+ shoppers are browsing right now</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-primary-700 shadow-lg shadow-black/10 transition hover:bg-slate-100"
              >
                Start Shopping
              </Link>
              <Link
                to="/products?category=Electronics"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                Explore Deals
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <h3 className="mb-3 text-2xl font-semibold">Fast delivery</h3>
              <p className="text-white/80">
                Reliable shipping with quick turnaround for everyday essentials
                and standout finds.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <h3 className="mb-3 text-2xl font-semibold">Secure checkout</h3>
              <p className="text-white/80">
                Safe payments, smooth tracking, and thoughtful support from
                order to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Promotional Banner */}
      <section className="py-6">
        <div className="container-custom">
          <div className="flex flex-col gap-4 rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-slate-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                Limited time offer
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                Summer Sale — up to 40% off selected favorites
              </h3>
              <p className="mt-2 text-gray-600">
                Discover standout electronics, clothing, and home essentials
                while stock lasts.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/products?category=Electronics" className="btn-primary">
                Shop Electronics
              </Link>
              <Link to="/products" className="btn-secondary">
                See All Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
                Shop by category
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Featured Categories
              </h2>
              <p className="mt-2 text-gray-600">
                Browse beautifully organized collections crafted for every style
                and need.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center font-semibold text-primary-600 transition hover:text-primary-700"
            >
              Browse all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className={`group relative overflow-hidden rounded-[28px] p-8 text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.45)] bg-gradient-to-br ${category.color}`}
              >
                <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/10" />
                <div className="relative z-10">
                  <span className="text-sm uppercase tracking-[0.3em] text-white/95 drop-shadow-lg">
                    {category.name}
                  </span>
                  <h3 className="my-4 text-3xl font-bold text-white drop-shadow-lg">
                    {category.name}
                  </h3>
                  <p className="max-w-sm leading-relaxed text-white/95 drop-shadow-lg">
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
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
                Best Rated Picks
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Featured Products
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Curated products loved by shoppers and backed by strong reviews.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center font-semibold text-primary-600 transition hover:text-primary-700"
            >
              View all products →
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 h-48 rounded-2xl bg-slate-200"></div>
                  <div className="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
                  <div className="mb-2 h-4 w-1/2 rounded bg-slate-200"></div>
                  <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-medium text-slate-700">
                No featured products are available right now.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Please check back soon for our latest picks.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
