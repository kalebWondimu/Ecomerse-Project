import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import ProductCard from "../components/products/ProductCard";
import productService from "../services/productService";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const normalizeCategory = (value) => {
    if (!value) return "all";
    const normalized = value.toString().toLowerCase();
    if (normalized === "electronics") return "Electronics";
    if (normalized === "clothing") return "Clothing";
    if (normalized === "books") return "Books";
    if (normalized === "home & garden" || normalized === "home&garden")
      return "Home & Garden";
    if (normalized === "sports") return "Sports";
    if (normalized === "toys") return "Toys";
    return "all";
  };
  const [selectedCategory, setSelectedCategory] = useState(
    normalizeCategory(searchParams.get("category")),
  );
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    extractCategories();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const nextCategory = normalizeCategory(categoryFromUrl);
    setSelectedCategory((prev) =>
      prev === nextCategory ? prev : nextCategory,
    );
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(currentPage);
    }, 250);

    return () => clearTimeout(handler);
  }, [selectedCategory, sortBy, searchTerm, currentPage]);

  const buildProductParams = (page = 1) => {
    const params = {
      page,
      limit: pageSize,
      sort: sortBy,
    };

    if (selectedCategory && selectedCategory !== "all") {
      params.category = selectedCategory;
    }

    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (priceRange.min) {
      params.minPrice = Number(priceRange.min);
    }

    if (priceRange.max) {
      params.maxPrice = Number(priceRange.max);
    }

    return params;
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = buildProductParams(page);
      const data = await productService.getProducts(params);
      const payload =
        data && Array.isArray(data.products)
          ? data
          : { products: [], totalCount: 0, currentPage: page, totalPages: 1 };
      const nextProducts = Array.isArray(payload.products)
        ? payload.products
        : [];
      setProducts(nextProducts);
      setTotalCount(Number(payload.totalCount || nextProducts.length || 0));
      setTotalPages(
        Math.max(
          1,
          Number(
            payload.totalPages ||
              Math.ceil(nextProducts.length / pageSize) ||
              1,
          ),
        ),
      );
      setCurrentPage(Number(payload.currentPage || page));
    } catch (error) {
      console.error("Failed to load products", error);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = () => {
    const cats = [
      "Electronics",
      "Clothing",
      "Books",
      "Home & Garden",
      "Sports",
      "Toys",
    ];
    setCategories(cats);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleCategoryChange = (value) => {
    const normalized = normalizeCategory(value);
    setSelectedCategory(normalized);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (normalized === "all") {
      params.delete("category");
    } else {
      params.set("category", normalized);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
    setSearchParams({});
    setCurrentPage(1);
    fetchProducts(1);
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
              Featured Collection
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Products
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Discover amazing products at great prices, curated for everyday
              living.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            {totalCount > 0
              ? `${totalCount} items available`
              : "Explore the catalog"}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 pr-24 w-full border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-2 text-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary flex items-center justify-center gap-2 rounded-xl"
          >
            <FiFilter /> Filters
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field md:w-48 border-slate-200 bg-slate-50"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div
          className={`
          md:w-64 md:block
          ${showFilters ? "block" : "hidden"}
          fixed md:relative inset-0 z-50 md:z-auto bg-white md:bg-transparent p-4 md:p-0
          md:sticky md:top-24 md:h-fit
        `}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === "all"}
                    onChange={() => handleCategoryChange("all")}
                    className="mr-2 accent-primary-600"
                  />
                  All Categories
                </label>
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2 accent-primary-600"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="input-field text-sm"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="btn-primary w-full mt-2 text-sm"
              >
                Apply Price
              </button>
            </div>

            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
                >
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {products.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {totalCount}
                  </span>{" "}
                  products
                </p>
                <p>
                  Page{" "}
                  <span className="font-semibold text-slate-800">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {getVisiblePages().map((page, index) =>
                    page === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-gray-500"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${currentPage === page ? "bg-primary-600 text-white shadow-sm" : "border border-slate-300 text-slate-700 hover:border-primary-500 hover:text-primary-600"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center shadow-sm">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-2xl font-semibold text-slate-900">
                No products found
              </h3>
              <p className="mb-6 text-sm text-slate-600 sm:text-base">
                Try adjusting your search or filters to find what you need.
              </p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
