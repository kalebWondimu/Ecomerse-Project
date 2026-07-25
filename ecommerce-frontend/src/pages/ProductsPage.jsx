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
    fetchProducts();
    extractCategories();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setSelectedCategory(normalizeCategory(categoryFromUrl));
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(currentPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [selectedCategory, sortBy, searchTerm, currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sort: sortBy,
        search: searchTerm || undefined,
        page,
        limit: pageSize,
      };
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
    let filtered = [...products];
    if (priceRange.min) {
      filtered = filtered.filter((p) => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((p) => p.price <= Number(priceRange.max));
    }
    setProducts(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    const normalized = normalizeCategory(value);
    setSelectedCategory(normalized);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
        <p className="text-gray-600">
          Discover amazing products at great prices
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 pr-24 w-full"
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
            className="md:hidden btn-secondary flex items-center justify-center gap-2"
          >
            <FiFilter /> Filters
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field md:w-48"
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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === "all"}
                    onChange={() => handleCategoryChange("all")}
                    className="mr-2"
                  />
                  All Categories
                </label>
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2"
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
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500">
                  Showing {products.length} of {totalCount} products
                </p>
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
                        className={`rounded-lg px-3 py-2 text-sm ${currentPage === page ? "bg-primary-600 text-white" : "border border-gray-300 text-gray-700"}`}
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
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters
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
