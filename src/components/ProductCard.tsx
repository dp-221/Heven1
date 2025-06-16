import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_trending: boolean;
  stock_quantity: number;
  images: Array<{
    image_url: string;
  }>;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
          <img
            src={product.images[0]?.image_url || ''}
            alt={product.name}
            className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}
          {product.is_trending && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Trending
            </div>
          )}
        </div>
      </Link>

      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50"
      >
        <Heart 
          size={16} 
          className={`${inWishlist ? 'text-red-500 fill-current' : 'text-gray-600'} hover:text-red-500`} 
        />
      </button>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-black transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              ₹{product.price}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.original_price}
              </span>
            )}
          </div>
          {product.stock_quantity === 0 && (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          )}
        </div>

        <div className="mt-3">
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors duration-200 block text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;