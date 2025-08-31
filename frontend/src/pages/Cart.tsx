import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/AuthProvider';
import { apiUrl, getAuthHeaders } from '@/lib/api';
import axios from 'axios';

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
  const { user, setUser } = useAuthContext();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [modalAutoTriggered, setModalAutoTriggered] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [addrForm, setAddrForm] = useState({
    personal_address: '',
    shoping_address: '',
    billing_address: '',
    address_village: '',
    landmark: '',
    city: '',
    state: '',
    country: '',
    zip: '',
  });

  // Refs for auto-focus
  const refPersonal = useRef<HTMLTextAreaElement | null>(null);
  const refVillage = useRef<HTMLInputElement | null>(null);
  const refCity = useRef<HTMLInputElement | null>(null);
  const refState = useRef<HTMLInputElement | null>(null);
  const refCountry = useRef<HTMLInputElement | null>(null);
  const refZip = useRef<HTMLInputElement | null>(null);
  const refLandmark = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl('/clients/user/getcart'), {
          credentials: 'include',
          headers: {
            ...getAuthHeaders(),
          },
        });
        if (res.status === 401) {
          toast.error('Session expired, please log in');
          navigate('/auth');
          return;
        }
        const data = await res.json();
        if (data?.data) {
          setCartItems(
            data.data.map((item: any) => ({
              id: item._id,
              productId: item.productId,
              name: item.title,
              gender: item.gender,
              category: item.category,
              theme: item.theme,
              description: item.description || "N/A",
              color: item.color || "N/A",
              size: item.size || "N/A",
              price: item.price,
              quantity: item.Qty,
              image: Array.isArray(item.image) ? item.image[0] : item.image,
              brand: item.brand || "N/A",
            }))
          );
        } else {
          setCartItems([]);
        }
      } catch (err) {
        toast.error('Failed to load cart');
      }
      setLoading(false);
    };
    fetchCart();
  }, [user, navigate]);

  // Fetch real products for recommendations
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(apiUrl('/clients/products'), {
          withCredentials: true,
        });
        if (res.data?.data && Array.isArray(res.data.data)) {
          const products = res.data.data;
          // Get random products for top selling (first 4)
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setTopSellingProducts(shuffled.slice(0, 4));
          setNewArrivals(shuffled.slice(4, 8));
        }
      } catch (err) {
        console.error('Failed to fetch products for recommendations:', err);
      }
    };
    fetchProducts();
  }, []);

  const ensureLoggedIn = () => {
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/auth');
      return false;
    }
    return true;
  };

  const isProfileComplete = (u: any): boolean => {
    if (!u) return false;
    const address = typeof u.address === 'string' ? (() => { try { return JSON.parse(u.address); } catch { return {}; } })() : (u.address || {});
    const required = [
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      u.gender,
      u.dob,
      address.city,
      address.state,
      address.country,
      address.zip,
      address.address_village,
    ];
    return required.every((v) => v !== undefined && v !== null && String(v).trim() !== '' && String(v).toLowerCase() !== 'n/a');
  };

  const profileComplete = isProfileComplete(user);
  const addressObj = (() => {
    if (!user) return {} as any;
    let a: any = user.address || {};
    if (typeof a === 'string') {
      try { a = JSON.parse(a); } catch { a = {}; }
    }
    return a || {};
  })();

  // Auto-open address modal if profile incomplete (only once per visit)
  useEffect(() => {
    if (!user) return;
    if (profileComplete) return;
    if (modalAutoTriggered) return;
    setShowAddrModal(true);
    setModalAutoTriggered(true);
  }, [user, profileComplete, modalAutoTriggered]);

  // Prefill address form when user or address changes
  useEffect(() => {
    setAddrForm({
      personal_address: addressObj.personal_address || '',
      shoping_address: addressObj.shoping_address || '',
      billing_address: addressObj.billing_address || '',
      address_village: addressObj.address_village || '',
      landmark: addressObj.landmark || '',
      city: addressObj.city || '',
      state: addressObj.state || '',
      country: addressObj.country || '',
      zip: addressObj.zip || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-focus the first missing field when modal opens
  useEffect(() => {
    if (!showAddrModal) return;
    // Determine order of importance for completion
    const order: Array<{ key: keyof typeof addrForm; ref: React.RefObject<any> }> = [
      { key: 'personal_address', ref: refPersonal },
      { key: 'address_village', ref: refVillage },
      { key: 'city', ref: refCity },
      { key: 'state', ref: refState },
      { key: 'zip', ref: refZip },
      { key: 'country', ref: refCountry },
      { key: 'landmark', ref: refLandmark },
    ];
    const firstMissing = order.find(({ key }) => !String((addrForm as any)[key] || '').trim());
    const targetRef = firstMissing?.ref || refPersonal;
    // Delay to ensure modal inputs are mounted
    setTimeout(() => targetRef.current?.focus(), 0);
  }, [showAddrModal, addrForm]);

  const onAddrChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { name, value } = e.target;
    setAddrForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureLoggedIn()) return;
    setAddrSaving(true);
    try {
      const form = new FormData();
      if (addrForm.personal_address) form.append('personal_address', addrForm.personal_address);
      if (addrForm.shoping_address) form.append('shoping_address', addrForm.shoping_address);
      if (addrForm.billing_address) form.append('billing_address', addrForm.billing_address);
      if (addrForm.address_village) form.append('address_village', addrForm.address_village);
      if (addrForm.landmark) form.append('landmark', addrForm.landmark);
      if (addrForm.city) form.append('city', addrForm.city);
      if (addrForm.state) form.append('state', addrForm.state);
      if (addrForm.country) form.append('country', addrForm.country);
      if (addrForm.zip) form.append('zip', addrForm.zip);

      const res = await fetch(apiUrl('/clients/user/me'), { method: 'PATCH', body: form, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.user) {
        toast.error(data?.msg || 'Failed to update address');
        setAddrSaving(false);
        return;
      }
      setUser(data.user);
      toast.success('Address updated');
      setShowAddrModal(false);
    } catch (err) {
      toast.error('Address update failed');
    }
    setAddrSaving(false);
  };

  const removeItem = async (id: string) => {
    if (!ensureLoggedIn()) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/clients/user/remove/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.msg === 'Product Removed') {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success('Item removed from cart');
      } else {
        toast.error(data?.msg || 'Failed to remove item');
      }
    } catch {
      toast.error('Error removing item');
    }
    setLoading(false);
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (!ensureLoggedIn()) return;
    if (newQuantity < 1) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/clients/user/updatecart/${id}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ Qty: newQuantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.msg === 'Cart updated') {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
        toast.success('Quantity updated');
      } else {
        toast.error(data?.msg || 'Failed to update quantity');
      }
    } catch {
      toast.error('Error updating quantity');
    }
    setLoading(false);
  };

  const buyProducts = async () => {
    if (!ensureLoggedIn()) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Enforce profile completion before checkout
    if (!isProfileComplete(user)) {
      setShowAddrModal(true);
      toast.info('Add your shipping address to continue.');
      return;
    }
    // Razorpay flow
    const loadRazorpay = () => new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    try {
      setPaying(true);
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error('Razorpay SDK failed to load. Check your network.');
        setPaying(false);
        return;
      }

      // 1) Get key
      const keyRes = await fetch(apiUrl('/clients/payments/razorpay/key'), { credentials: 'include', headers: { ...getAuthHeaders() } });
      const keyData = await keyRes.json().catch(() => ({}));
      if (!keyRes.ok || !keyData?.key) {
        toast.error(keyData?.msg || 'Failed to get payment key');
        setPaying(false);
        return;
      }

      // 2) Create order in backend (amount in paise)
      const amountInPaise = Math.round((subtotal + shipping + tax) * 100);
      const orderRes = await fetch(apiUrl('/clients/payments/razorpay/order'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ amountInPaise, currency: 'INR', notes: { cartCount: cartItems.length } })
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData?.order?.id) {
        toast.error(orderData?.msg || 'Failed to initiate payment');
        setPaying(false);
        return;
      }

      const options: any = {
        key: keyData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'Zixx',
        description: 'Order Payment',
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        theme: { color: '#D92030' },
        handler: async (response: any) => {
          try {
            // 3) Verify signature
            const verifyRes = await fetch(apiUrl('/clients/payments/razorpay/verify'), {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || verifyData?.ok !== true) {
              toast.error(verifyData?.msg || 'Payment verification failed');
              setPaying(false);
              return;
            }

            // 4) Place one consolidated order for all cart items
            const cartIds = cartItems.map((it) => it.id);
            const placeRes = await fetch(apiUrl('/clients/order/buy-selected'), {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({
                cartIds,
                paymentDetails: {
                  provider: 'razorpay',
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id
                }
              })
            });
            const placeData = await placeRes.json().catch(() => ({}));
            if (!placeRes.ok || placeData?.ok !== true) {
              toast.error(placeData?.msg || 'Failed to place order after payment');
              setPaying(false);
              return;
            }

            setCartItems([]);
            toast.success('Payment successful! Order placed.');
            navigate('/orders');
          } catch (err) {
            toast.error('Unexpected error after payment');
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error(e);
      toast.error('Payment initialization failed');
      setPaying(false);
    }
  };

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (promoCode.toLowerCase() === 'save10') {
      toast.success('Promo code applied! 10% discount');
    } else {
      toast.error('Invalid promo code');
    }
  };


  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const tax = subtotal * 0.09;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow page-container pt-4 sm:pt-6 pb-8 sm:pb-16">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Shopping Cart</h1>
        {user && !profileComplete && !bannerDismissed && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Complete your profile to checkout</p>
              <p className="text-xs sm:text-sm">Add your personal and address details to proceed with the payment.</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/account?completeProfile=1" className="px-3 py-2 rounded-md bg-[#D92030] text-white hover:bg-[#BC1C2A] text-xs sm:text-sm">Update Now</Link>
              <button onClick={() => setBannerDismissed(true)} className="px-3 py-2 rounded-md border border-yellow-300 text-yellow-800 hover:bg-yellow-100 text-xs sm:text-sm">Dismiss</button>
            </div>
          </div>
        )}
        
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
                        className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-6 cursor-pointer hover:bg-gray-100 transition ${index < cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        <div className="w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden image-container">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain product-image" 
                          />
                        </div>
                        <div className="flex-grow space-y-2 min-w-0 max-w-full overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="min-w-0 max-w-full overflow-hidden">
                              <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 break-words">{item.name}</h3>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                <p className="truncate"><span className="font-medium">Brand:</span> {item.brand}</p>
                                <p className="truncate"><span className="font-medium">Color:</span> {item.color}</p>
                                <p className="truncate"><span className="font-medium">Size:</span> {item.size}</p>
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
                {/* Shipping Address Summary */}
                {user && profileComplete ? (
                  <div className="mb-4 sm:mb-6 bg-white/60 rounded-xl p-4 border border-white/80">
                    <div className="font-semibold mb-1">Shipping Address</div>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <div>{[user.first_name, user.last_name].filter(Boolean).join(' ')}</div>
                      {user.phone && <div>+{String(user.phone)}</div>}
                      {addressObj.personal_address && <div>{addressObj.personal_address}</div>}
                      <div>{[addressObj.address_village, addressObj.landmark].filter(Boolean).join(', ')}</div>
                      <div>{[addressObj.city, addressObj.state, addressObj.zip].filter(Boolean).join(', ')}</div>
                      <div>{addressObj.country}</div>
                    </div>
                    <div className="mt-2">
                      <button onClick={() => setShowAddrModal(true)} className="text-xs text-[#D92030] hover:underline">Edit address</button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 text-sm">
                    Add your shipping address in <button onClick={() => setShowAddrModal(true)} className="underline font-medium">Cart</button> or update in <Link to="/account" className="underline font-medium">Account</Link> to place your order.
                  </div>
                )}
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
                      className="bg-gray-800 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </form>
                
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 py-3 text-base font-extrabold rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-pink-200/40 border-2 border-white border-dashed tracking-wider uppercase transition-all duration-300 animate-bounce-slow"
                  style={{ letterSpacing: '0.1em', boxShadow: '0 4px 24px 0 rgba(236, 72, 153, 0.15)' }}
                  onClick={buyProducts}
                  disabled={cartItems.length === 0 || paying}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white animate-wiggle">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.5 19h9a2 2 0 001.85-1.3L17 13M7 13V6h13" />
                    </svg>
                    <span className="bg-white/20 px-3 py-1 rounded-xl text-white font-black text-lg drop-shadow-sm">{paying ? 'Processing...' : (profileComplete ? 'Buy Products' : 'Complete Profile to Checkout')}</span>
                  </span>
                </Button>
                {!profileComplete && (
                  <div className="text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
                    To place your order, please complete your profile details first.
                  </div>
                )}
                
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
            {topSellingProducts.map((product, index) => (
              <div key={product._id || index} className="bg-white rounded-lg shadow-sm spacing-sm hover:shadow-lg transition-shadow">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="aspect-square bg-gray-100 mb-3 sm:mb-4 rounded-lg overflow-hidden image-container">
                    <img 
                      src={Array.isArray(product.image) ? product.image[0] : product.image || `https://source.unsplash.com/400x400/${(product.category || 'fashion').replace(/\s+/g, '+')}`} 
                      alt={product.title} 
                      className="w-full h-full object-contain product-image" 
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm sm:text-lg font-bold text-[#D92030]">₹{product.price}</div>
                    {product.discount > 0 && (
                      <div className="text-xs sm:text-sm text-gray-500 line-through">₹{(product.price / (1 - product.discount / 100)).toFixed(2)}</div>
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
            {newArrivals.map((product, index) => (
              <div key={product._id || index} className="bg-white rounded-lg shadow-sm spacing-sm hover:shadow-lg transition-shadow">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="aspect-square bg-gray-100 mb-3 sm:mb-4 rounded-lg overflow-hidden image-container">
                    <img 
                      src={Array.isArray(product.image) ? product.image[0] : product.image || `https://source.unsplash.com/400x400/${(product.category || 'fashion').replace(/\s+/g, '+')}`} 
                      alt={product.title} 
                      className="w-full h-full object-contain product-image" 
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm sm:text-lg font-bold text-[#D92030]">₹{product.price}</div>
                    {product.discount > 0 && (
                      <div className="text-xs sm:text-sm text-gray-500 line-through">₹{(product.price / (1 - product.discount / 100)).toFixed(2)}</div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      {/* Address Edit Modal */}
      {showAddrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Edit Shipping Address</h3>
              <button onClick={() => setShowAddrModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={saveAddress} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Address</label>
                <textarea ref={refPersonal} name="personal_address" rows={2} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.personal_address} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village / Locality</label>
                  <input ref={refVillage} name="address_village" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.address_village} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input ref={refLandmark} name="landmark" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.landmark} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input ref={refCity} name="city" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.city} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input ref={refState} name="state" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.state} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input ref={refCountry} name="country" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.country} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input ref={refZip} name="zip" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92030] focus:border-transparent" value={addrForm.zip} onChange={onAddrChange} onKeyDown={(e) => e.stopPropagation()} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddrModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <Button type="submit" className="bg-[#D92030] hover:bg-[#BC1C2A]" disabled={addrSaving}>{addrSaving ? 'Saving...' : 'Save Address'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Cart;
