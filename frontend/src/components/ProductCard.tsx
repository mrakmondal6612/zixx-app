import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  title: string;
  image?: string;
  price: number; // Final calculated price
  basePrice?: number; // Original price
  discount?: {
    type: 'percentage' | 'fixed' | 'coupon';
    value: number;
  } | number; // Can be object (new) or number (legacy)
  oldPrice?: number; // optional explicit old price
  reviews?: number; // optional review count
  badge?: string; // e.g., 'Best Seller', 'New Arrival'
  className?: string;
}

const formatOldPrice = (price: number, basePrice?: number, discount?: any, oldPrice?: number) => {
  if (oldPrice && oldPrice > price) return oldPrice.toFixed(2);
  if (basePrice && basePrice > price) return basePrice.toFixed(2);
  
  // Handle discount object or number
  if (discount) {
    if (typeof discount === 'object' && discount.type === 'percentage' && discount.value > 0 && discount.value < 100) {
      const base = price / (1 - discount.value / 100);
      return base.toFixed(2);
    } else if (typeof discount === 'number' && discount > 0 && discount < 100) {
      const base = price / (1 - discount / 100);
      return base.toFixed(2);
    }
  }
  return '';
};

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  price,
  basePrice,
  discount,
  oldPrice,
  reviews,
  badge,
  className = ''
}) => {
  const computedOld = formatOldPrice(price, basePrice, discount, oldPrice);
  return (
    <Link to={`/product/${id}`} className={`group ${className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden bg-gray-100">
            <img
              src={image || 'https://via.placeholder.com/400x500?text=Product'}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          {badge && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#D92030] text-white px-3 py-1 rounded-full text-xs font-semibold">
                {badge}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-base font-bold mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 mb-3 text-sm">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            {typeof reviews === 'number' && (
              <span className="text-sm text-gray-600">({reviews})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#D92030]">₹{price}</span>
            {computedOld && (
              <span className="text-sm text-gray-500 line-through">₹{computedOld}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
