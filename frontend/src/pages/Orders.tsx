import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
  images?: string[];
  description?: string;
}

interface Order {
  _id: string;
  orderDate?: string;
  status?: string;
  totalAmount?: number;
  shippingAddress?: string;
  paymentStatus?: string;
  orderItems: OrderItem[];
  paymentDetails?: {
    paymentStatus?: string;
    [key: string]: any;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setOrders([]);
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
  const res = await fetch('/clients/user/orders', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setOrders([]);
          setError(errData.msg || 'Failed to fetch orders.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
          setError('No orders found.');
        }
      } catch (err: any) {
        setOrders([]);
        setError('Network error. Please try again.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 animate-gradient-x">
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-black text-center mb-12 drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight animate-bounce-slow">My Orders</h1>

        {loading ? (
          <div className="text-center text-lg font-medium text-gray-500 animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 font-medium">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-600">No orders found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {orders.map((order) => {
              const isCancellable = order.status !== 'cancelled' && order.status !== 'completed';

              const handleCancel = async () => {
                if (!window.confirm('Are you sure you want to cancel this order?')) return;
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`/order/cancel/${order._id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const data = await res.json();
                  if (res.ok && data.ok !== false) {
                    setOrders((prev) =>
                      prev.map((o) => (o._id === order._id ? { ...o, status: 'cancelled' } : o))
                    );
                  } else {
                    alert(data.msg || 'Failed to cancel order.');
                  }
                } catch {
                  alert('Network error. Please try again.');
                }
              };

              return (
                <Card
                  key={order._id}
                  className="bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl p-7 shadow-2xl border-2 border-white/60 hover:scale-[1.025] hover:shadow-pink-200/40 transition-all duration-300 animate-float"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-400 font-mono select-all">
                      <span className="font-bold text-purple-500">#</span>{order._id.slice(-8)}
                    </span>
                    <Badge
                      className={`capitalize text-xs font-bold px-4 py-1 rounded-full shadow-sm tracking-widest border-2 border-white/60 ${
                        order.status === 'completed'
                          ? 'bg-gradient-to-r from-green-200 to-green-400 text-green-900'
                          : order.status === 'cancelled'
                          ? 'bg-gradient-to-r from-red-200 to-red-400 text-red-900'
                          : 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900'
                      }`}
                    >
                      {order.status || 'pending'}
                    </Badge>
                  </div>

                  <div className="text-xs mb-1 text-gray-500"><span className="font-bold text-purple-600">Order Date:</span> {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</div>
                  <div className="text-xs mb-1 text-gray-500"><span className="font-bold text-pink-600">Total:</span> <span className="text-lg font-black text-pink-500">₹{Number(order.totalAmount).toFixed(2)}</span></div>
                  <div className="text-xs mb-1 text-gray-500"><span className="font-bold text-indigo-600">Shipping:</span> {order.shippingAddress ?? 'N/A'}</div>
                  <div className="text-xs mb-4 text-gray-500"><span className="font-bold text-purple-600">Payment:</span> {order.paymentStatus ?? order.paymentDetails?.paymentStatus ?? 'N/A'}</div>

                  <div className="text-xs font-bold mb-2 text-purple-700 tracking-widest uppercase">Items</div>
                  <div className="space-y-3">
                    {order.orderItems?.length ? (
                      order.orderItems.map((item, idx) => {
                        let imageSrc = '';
                        if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                          imageSrc = item.image;
                        } else if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') {
                          imageSrc = item.images[0];
                        } else {
                          imageSrc = '/placeholder.svg';
                        }

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-xl border-2 border-white/60 shadow-sm hover:scale-105 transition-all duration-200"
                          >
                            <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-pink-200 shadow-pink-100 rounded-xl overflow-visible">
                              <img
                                src={imageSrc}
                                alt={item.productName || 'Product'}
                                className="w-full h-full object-contain rounded-xl"
                                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                              />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="font-black text-base text-purple-900 truncate">{item.productName || item.productId}</div>
                              {item.description && <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>}
                              <div className="flex gap-2 flex-wrap text-xs">
                                <span className="bg-pink-200/60 text-pink-700 px-2 py-0.5 rounded-full font-bold">Qty: {item.quantity}</span>
                                <span className="bg-purple-200/60 text-purple-700 px-2 py-0.5 rounded-full font-bold">₹{Number(item.price).toFixed(2)}</span>
                                <span className="bg-indigo-200/60 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Total: ₹{Number(item.totalPrice).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-sm">No items found.</div>
                    )}
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      onClick={handleCancel}
                      disabled={!isCancellable}
                      className={`px-5 py-2 rounded-2xl font-black text-white shadow-lg transition-all duration-200 border-2 border-white/60 tracking-widest text-sm uppercase ${
                        isCancellable
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 animate-bounce-slow'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {order.status === 'cancelled'
                        ? 'Cancelled'
                        : order.status === 'completed'
                        ? 'Completed'
                        : 'Cancel Order'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Orders;
