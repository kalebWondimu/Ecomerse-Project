import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import adminService from "../../services/adminService";
import productService from "../../services/productService";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
  FiPackage,
  FiDollarSign,
  FiHash,
  FiTag,
  FiImage,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9;
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState([
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Accessories",
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Electronics",
    images: [],
  });
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const payload = await productService.getProducts({
        page,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
      });
      const nextProducts = Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload)
          ? payload
          : [];

      setProducts(nextProducts);
      setTotalCount(Number(payload?.totalCount || nextProducts.length || 0));
      setTotalPages(
        Math.max(
          1,
          Number(
            payload?.totalPages ||
              Math.ceil(nextProducts.length / pageSize) ||
              1,
          ),
        ),
      );
      setCurrentPage(Number(payload?.currentPage || page));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addImage = () => {
    if (imageUrl && imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl.trim()],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "Electronics",
      images: [],
    });
    setImageUrl("");
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category || "Electronics",
      images: product.images || [],
    });
    setShowModal(true);
  };

  const openDeleteConfirm = (product) => {
    setDeletingProduct(product);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (formData.stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
        toast.success("Product updated successfully");
      } else {
        await adminService.createProduct(productData);
        toast.success("Product created successfully");
      }

      const targetPage = editingProduct ? currentPage : 1;
      setCurrentPage(targetPage);
      await fetchProducts(targetPage);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      setSubmitting(true);
      await adminService.deleteProduct(deletingProduct.id);
      const nextPage =
        products.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      setCurrentPage(nextPage);
      await fetchProducts(nextPage);
      toast.success("Product deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add New Product
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                {totalCount} product{totalCount === 1 ? "" : "s"} total
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mb-6 flex flex-wrap items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-slate-600">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchProducts(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {getVisiblePages().map((page, index) =>
                  page === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchProducts(page)}
                      className={`rounded-lg px-3 py-2 text-sm transition ${currentPage === page ? "bg-primary-600 text-white shadow-sm" : "border border-slate-300 text-slate-700 hover:border-primary-500 hover:text-primary-600"}`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    fetchProducts(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/300?text=Product";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <FiPackage className="h-16 w-16 text-primary-400" />
                      </div>
                    )}

                    {/* Stock Badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Low Stock: {product.stock}
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {product.category || "Uncategorized"}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm">
                <FiPackage className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-medium text-gray-700">
                  No products found
                </h3>
                <p className="mb-6 text-gray-500">
                  {searchTerm
                    ? "Try a different search term"
                    : "Add your first product to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreateModal}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Product
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="e.g., MacBook Pro"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="input-field"
                    placeholder="Product description..."
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="input-field pl-10"
                        placeholder="29.99"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className="input-field pl-10"
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Enter image URL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>

                  {/* Image List */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/100?text=Error";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" />
                        <span>
                          {editingProduct ? "Update Product" : "Create Product"}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Product
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deletingProduct.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingProduct(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
