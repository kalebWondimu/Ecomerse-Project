import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const favoritesKey = user ? `favorites_${user.id}` : "favorites_guest";

  useEffect(() => {
    const stored = localStorage.getItem(favoritesKey);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        setFavorites([]);
      }
    }
  }, [favoritesKey]);

  const removeFavorite = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem(favoritesKey, JSON.stringify(updated));
    toast.success("Removed from favorites");
  };

  return (
    <div className="container-custom py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Your Favorites</h1>
          <p className="text-gray-600 mt-2">
            Products you saved to revisit later.
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">No favorites yet</h2>
          <p className="text-gray-500 mb-6">
            Browse products and tap the heart icon to save items for later.
          </p>
          <Link
            to="/products"
            className="inline-flex px-6 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-sm overflow-hidden"
            >
              <Link to={`/products/${product.id}`} className="block">
                <div className="h-52 bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400?text=Product";
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-5xl text-gray-300">
                      📦
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {product.category || "Uncategorized"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ${product.price}
                  </span>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
