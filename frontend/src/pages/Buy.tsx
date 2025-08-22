import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';

interface CartItem {
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
}

const Buy: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to buy products');
        navigate('/auth');
        return;
      }
      try {
  const res = await fetch('/clients/user/getcart', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.data) {
          const items = data.data.map((item: any) => ({
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
          }));
          setCartItems(items);
          setSelected(items.map((i: CartItem) => i.id)); // All selected by default
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

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handlePlaceOrder = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one product to buy.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to buy products');
      navigate('/auth');
      return;
    }
    try {
      const selectedItems = cartItems.filter((item) => selected.includes(item.id));
  const res = await fetch('/clients/order/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: selectedItems }),
      });
      const data = await res.json();
      if (data.msg === 'Order placed successfully') {
        toast.success('Order placed!');
        navigate('/orders');
      } else {
        toast.error(data.msg || 'Order failed');
      }
    } catch (err) {
      toast.error('Error placing order');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow page-container pt-4 sm:pt-6 pb-8 sm:pb-16">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Select Products to Buy</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => handleSelect(item.id)}
                    className="w-5 h-5 accent-[#D92030]"
                  />
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-gray-100" />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-base truncate">{item.name}</h3>
                    <div className="text-xs text-gray-600">{item.brand} | {item.color} | {item.size}</div>
                  </div>
                  <div className="font-bold text-lg text-[#D92030]">₹{item.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-[#D92030] hover:bg-[#BC1C2A] py-3 text-base font-semibold rounded-lg"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Buy;
