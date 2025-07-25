import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { toast } from 'sonner';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  gender: string;
  category: string;
  theme: string;
  description: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch cart items from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Please log in to add to cart');
            window.location.href = '/auth';
            return;
          }
      try {
        const res = await fetch('/api/user/getcart', {
          headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
        });
        const data = await res.json();
        if (data.data) {
          setCartItems(data.data.map((item) => ({
            id: item._id,
            productId: item.productId,
            name: item.title,
            gender: item.gender,
            category: item.category,
            theme: item.theme,
            description: item.description || '',
            color: item.color || '',
            size: item.size || '',
            price: item.price,
            quantity: item.Qty,
            image: Array.isArray(item.image) ? item.image[0] : item.image,
            brand: item.brand || '',
          })));
        } else {
          setCartItems([]);
        }
      } catch (err) {
        toast.error('Failed to load cart');
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  // Remove product from cart (backend)
  const removeItem = async (id: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to remove items');
      window.location.href = '/auth';
      return;
    }
    try {
      const res = await fetch(`/api/user/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (data.msg === 'Product Removed') {
        setCartItems(prev => prev.filter(item => item.id !== id));
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (err) {
      toast.error('Error removing item');
    }
    setLoading(false);
  };

  // Buy all products in cart
  const buyProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to buy products');
      window.location.href = '/auth';
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      setLoading(false);
      return;
    }
    try {
      // console.log("User ID:", token);
      // console.log("Request Body:", cartItems);
      const res = await fetch('/api/order/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Order response:', res);
      const data = await res.json();
      console.log('Order response:', data);
      if (data.msg === 'Order placed successfully') {
        setCartItems([]);
        toast.success('Order placed!');
      } else {
        toast.error(data.msg || 'Order failed');
      }
    } catch (err) {
      // console.log('Error placing order:', err);
      toast.error('Error placing order');
    }
    setLoading(false);
  };

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Promo code feature coming soon!');
  };

  // Update product quantity in cart (backend)
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to update quantity');
      window.location.href = '/auth';
      return;
    }
    try {
      const res = await fetch(`/api/user/updatecart/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Qty: newQuantity })
      });
      const data = await res.json();
      if (data.msg === 'Cart updated') {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
        toast.success('Quantity updated');
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (err) {
      toast.error('Error updating quantity');
    }
    setLoading(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.09;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow page-container pt-4 sm:pt-6 pb-8 sm:pb-16">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Shopping Cart</h1>
        
        <div className="responsive-flex lg:gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            {cartItems.length > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="space-y-0">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`responsive-flex p-4 sm:p-6 cursor-pointer hover:bg-gray-100 transition ${index < cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                        onClick={() => navigate(`/cart/product/${item.id}`)}
                      >
                        <div className="w-full sm:w-20 md:w-24 h-20 md:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden image-container">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain product-image" 
                          />
                        </div>
                        <div className="flex-grow space-y-2 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{item.name}</h3>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Brand:</span> {item.brand}</p>
                                <p><span className="font-medium">Color:</span> {item.color}</p>
                                <p><span className="font-medium">Size:</span> {item.size}</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <div className="font-bold text-lg sm:text-xl text-[#D92030]">₹{item.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-green-600 font-medium">Delivery by {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                            <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 sm:px-3 py-1 hover:bg-gray-100 transition-colors text-gray-800"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 sm:px-4 py-1 font-medium border-x border-gray-300 text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 sm:px-3 py-1 hover:bg-gray-100 transition-colors text-gray-800"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                              className="flex items-center gap-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors w-fit"
                              disabled={loading}
                            >
                              <Trash2 size={12} />
                              <span className="text-xs sm:text-sm font-medium">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center sm:text-right font-extrabold text-lg sm:text-2xl my-4 sm:my-6 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 rounded-2xl shadow-lg p-4 border-2 border-white/60 animate-gradient-x">
                  <span className="uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow">Subtotal</span>
                  <span className="ml-2 text-pink-600 animate-pulse">({cartItems.length} items): ₹{subtotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm spacing-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base">It looks like you haven't added anything to your cart yet.</p>
                <Link to="/">
                  <Button className="bg-[#D92030] hover:bg-[#BC1C2A] px-6 py-3">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="w-full lg:w-[300px] xl:w-[350px] flex-shrink-0">
              <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 rounded-3xl shadow-xl p-6 sticky top-28 border-2 border-white/60">
                <h2 className="font-black text-xl mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow">Order Summary</h2>
                <div className="space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-pink-500">Subtotal</span>
                    <span className="font-bold text-indigo-600">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-purple-500">Shipping</span>
                    <span className="font-bold text-pink-600">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-indigo-500">Tax</span>
                    <span className="font-bold text-purple-600">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-dashed border-pink-300 pt-3 flex justify-between font-black text-lg sm:text-xl">
                    <span className="uppercase tracking-widest text-indigo-700">Total</span>
                    <span className="text-pink-600 animate-pulse">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <form onSubmit={applyPromoCode} className="mb-4 sm:mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D92030] text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </form>
                
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 py-3 text-base font-extrabold rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-pink-200/40 border-2 border-white border-dashed tracking-wider uppercase transition-all duration-300 animate-bounce-slow"
                  style={{ letterSpacing: '0.1em', boxShadow: '0 4px 24px 0 rgba(236, 72, 153, 0.15)' }}
                  onClick={() => navigate('/buy')}
                  disabled={cartItems.length === 0}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white animate-wiggle">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.5 19h9a2 2 0 001.85-1.3L17 13M7 13V6h13" />
                    </svg>
                    <span className="bg-white/20 px-3 py-1 rounded-xl text-white font-black text-lg drop-shadow-sm">Buy Products</span>
                  </span>
                </Button>
                
                {/* Categories Section with Separate Images */}
                <div className="border-t-2 pt-4 sm:pt-6">
                  <div className="space-y-4 mb-6">
                    {/* Men's Striped Shirt */}
                    <div className="category-section h-40 sm:h-48">
                      <img 
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=300" 
                        alt="Men's Striped Shirts" 
                        className="w-full h-full object-cover"
                      />
                      <div className="category-overlay">
                        <h3 className="category-title text-sm sm:text-base">MEN'S SHIRTS</h3>
                      </div>
                    </div>
                    
                    {/* Boxers & Shorts with Icon */}
                    <div className="category-section h-40 sm:h-48">
                      <img 
                        src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&h=300" 
                        alt="Boxers & Shorts" 
                        className="w-full h-full object-cover"
                      />
                      <div className="category-overlay">
                        <div className="text-center">
                          <p className="text-white text-xs font-medium mb-2">BOXERS & SHORTS</p>
                          <ChevronDown className="text-white mx-auto" size={24} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Features */}
                  <div className="responsive-grid-3 gap-3 text-center">
                    <div>
                      <div className="mx-auto mb-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">FREE FAST DELIVERY</p>
                    </div>
                    <div>
                      <div className="mx-auto mb-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 9.35v5.3a.5.5 0 00.78.42l4.5-2.65a.5.5 0 000-.84l-4.5-2.65a.5.5 0 00-.78.42z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">24/7 CUSTOMER SERVICE</p>
                    </div>
                    <div>
                      <div className="mx-auto mb-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">MONEY BACK GUARANTEE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Top Selling Products Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">TOP SELLING</h2>
          <div className="responsive-grid-4">
            {[
              {
                name: 'Vertical Striped Shirt',
                price: 29.99,
                oldPrice: 44.99,
                image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true'
              },
              {
                name: 'Orange Graphic T-shirt',
                price: 19.99,
                image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/1ae9ee2293ad29eef209760dacb27c2cfcc587ac?placeholderIfAbsent=true'
              },
              {
                name: 'Loose Fit Bermuda Shorts',
                price: 34.99,
                image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true'
              },
              {
                name: 'Faded Skinny Jeans',
                price: 49.99,
                image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true'
              }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm spacing-sm hover:shadow-lg transition-shadow">
                <Link to={`/product?name=${encodeURIComponent(product.name)}`} className="block">
                  <div className="aspect-square bg-gray-100 mb-3 sm:mb-4 rounded-lg overflow-hidden image-container">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover product-image" 
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm sm:text-lg font-bold text-[#D92030]">₹{product.price}</div>
                    {product.oldPrice && (
                      <div className="text-xs sm:text-sm text-gray-500 line-through">₹{product.oldPrice}</div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* NEW ARRIVALS Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">NEW ARRIVALS</h2>
          <div className="responsive-grid-4">
            {[
              {
                name: 'T-SHIRT WITH TAPE DETAILS',
                price: 120,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=500'
              },
              {
                name: 'SKINNY FIT JEANS',
                price: 240,
                oldPrice: 260,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&h=500'
              },
              {
                name: 'CHECKERED SHIRT',
                price: 180,
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&h=500'
              },
              {
                name: 'SLEEVE STRIPED T-SHIRT',
                price: 130,
                oldPrice: 160,
                image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&h=500'
              }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm spacing-sm hover:shadow-lg transition-shadow">
                <Link to={`/product?name=${encodeURIComponent(product.name)}`} className="block">
                  <div className="aspect-square bg-gray-100 mb-3 sm:mb-4 rounded-lg overflow-hidden image-container">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover product-image" 
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm sm:text-lg font-bold text-[#D92030]">₹{product.price}</div>
                    {product.oldPrice && (
                      <div className="text-xs sm:text-sm text-gray-500 line-through">₹{product.oldPrice}</div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Cart;
