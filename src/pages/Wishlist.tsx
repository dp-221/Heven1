import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Wishlist: React.FC = () => {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-gray-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-8">Save your favorite items for later by signing in to your account.</p>
          <Link
            to="/auth"
            className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-gray-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Start adding items you love to your wishlist.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: string) => {
    // For simplicity, we'll add the first available variant
    // In a real app, you might want to show a variant selector
    const product = items.find(item => item.product_id === productId);
    if (product) {
      // You would need to fetch variants for this product
      // For now, we'll just show an alert
      alert('Please visit the product page to select size and color options');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="mr-2" size={20} />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                <Link to={`/product/${item.product_id}`}>
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
                {item.product.original_price && (
                  <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 rounded text-xs font-semibold">
                    {Math.round(((item.product.original_price - item.product.price) / item.product.original_price) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link to={`/product/${item.product_id}`}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 hover:text-black transition-colors duration-200 line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(item.product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({item.product.review_count})</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{item.product.price}
                    </span>
                    {item.product.original_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.product.original_price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors duration-200 block text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(item.product_id)}
                    className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <ShoppingBag className="mr-2" size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;