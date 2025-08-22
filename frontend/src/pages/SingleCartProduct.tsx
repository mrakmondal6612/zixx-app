import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CartProduct {
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

const SingleCartProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CartProduct | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view product');
        navigate('/auth');
        return;
      }
      try {
        const res = await fetch(`/clients/user/getcart/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.data) {
          setProduct({
            id: data.data._id,
            productId: data.data.productId,
            name: data.data.title,
            gender: data.data.gender,
            category: data.data.category,
            theme: data.data.theme,
            description: data.data.description || '',
            color: data.data.color || '',
            size: data.data.size || '',
            price: data.data.price,
            quantity: data.data.Qty,
            image: Array.isArray(data.data.image) ? data.data.image[0] : data.data.image,
            brand: data.data.brand || '',
          });
        } else {
          toast.error('Product not found');
          navigate('/cart');
        }
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/cart');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleBuy = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to buy product');
      navigate('/auth');
      return;
    }
    try {
      const res = await fetch(`/clients/order/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ singleCartId: product?.id }),
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

  if (loading) return <div className="flex justify-center items-center h-40 text-lg font-semibold text-gray-600 animate-pulse">Loading...</div>;
  if (!product) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Header />
      <main className="flex-grow w-full max-w-2xl mx-auto px-2 md:px-6 py-10">
        <Card className="p-0 rounded-2xl shadow-2xl border border-purple-200 bg-white overflow-hidden">
          <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
            <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-6 md:p-8">
              <img
                src={product.image || '/public/placeholder.svg'}
                alt={product.name}
                className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-xl shadow-md border border-gray-200 bg-white"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center p-6 md:p-8">
              <h2 className="text-3xl font-extrabold mb-2 text-purple-800 break-words">{product.name}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">Brand: {product.brand}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Color: {product.color}</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Size: {product.size}</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Category: {product.category}</span>
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-semibold">Theme: {product.theme}</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Gender: {product.gender}</span>
              </div>
              <div className="text-gray-800 font-bold text-2xl mb-2">Price: <span className="text-purple-700">₹{product.price.toFixed(2)}</span></div>
              <div className="text-gray-700 text-base mb-4 whitespace-pre-line break-words">{product.description}</div>
              <Button className="w-full md:w-auto mt-2 bg-[#D92030] hover:bg-[#BC1C2A] px-8 py-3 text-white font-bold rounded-lg text-lg shadow-md" onClick={handleBuy} disabled={loading}>
                {loading ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SingleCartProduct;
