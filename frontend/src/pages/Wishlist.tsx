import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/AuthProvider';
import { apiUrl, getAuthHeaders } from '@/lib/api';

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  size?: string;
  color?: string;
  inStock: boolean;
  discount?: number;
  rating?: string;
  category?: string;
  theme?: string;
};

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    async function fetchWishlist() {
      try {
        const res = await fetch(apiUrl('/clients/user/wishlist'), {
          credentials: 'include',
          headers: { ...getAuthHeaders() },
        });
        if (res.status === 401) {
          toast.error('Session expired, please log in');
          navigate('/auth');
          return;
        }
        const data = await res.json();

        if (!Array.isArray(data.wishlist)) {
          console.error('Invalid wishlist data:', data);
          toast.error('Failed to load wishlist');
          return;
        }

        const formatted = data.wishlist.map((i: any) => ({
          id: i._id,
          name: i.title,
          price: i.price,
          discount: i.discount || 0,
          rating: i.rating?.toString() || '0',
          category: i.category || '',
          theme: i.theme || '',
          oldPrice: i.oldPrice,
          image: Array.isArray(i.image) ? i.image[0] : i.image,
          size: Array.isArray(i.size) ? i.size[0] : i.size,
          color: Array.isArray(i.color) ? i.color[0] : i.color,
          inStock: i.inStock !== false,
        }));

        setWishlistItems(formatted);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        toast.error('Error loading wishlist');
      }
    }

    fetchWishlist();
  }, [user]);

  const ensureLoggedIn = () => {
    if (!user) {
      toast.error('You must be logged in.');
      navigate('/auth');
      return false;
    }
    return true;
  };

  async function removeItem(id: string) {
    if (!ensureLoggedIn()) return;
    try {
      const res = await fetch(apiUrl('/clients/user/wishlist/remove'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId: id }),
      });

      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
        toast.success('Removed from wishlist');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData?.msg || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing wishlist item:', err);
      toast.error('Error removing item');
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    if (!ensureLoggedIn()) return;

    const size = typeof item.size === 'string' && item.size ? item.size : 'Free';
    const color = typeof item.color === 'string' && item.color ? item.color : 'Default';
    const description = (item as any).description || 'No description available';
    const brand = (item as any).brand || 'No brand';
    const gender = item.category || 'Unisex';
    const theme = item.theme || '';
    const category = item.category || '';
    const rating = item.rating || '0';
    const discount = item.discount || 0;
    const price = item.price;
    const Qty = 1;
    const afterQtyprice = (price - discount) * Qty;
    const total = afterQtyprice;
    const image = [item.image];

    const payload = {
      productId: item.id,
      title: item.name,
      description,
      brand,
      color,
      gender,
      price,
      discount,
      rating,
      category,
      theme,
      size,
      image,
      Qty,
      afterQtyprice,
      variation: { size, color, quantity: Qty },
      total,
    };

    try {
      const res = await fetch(apiUrl('/clients/user/addtocart'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`Added "${item.name}" to cart!`);
        setTimeout(() => navigate('/cart'), 800);
      } else {
        toast.error(data?.msg || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart fetch error:', err);
      toast.error('Could not add to cart');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Wishlist</h1>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{item.name}</h3>
                  {(item.size || item.color) && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span className="mx-1">|</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold">₹{item.price}</span>
                    {item.oldPrice && (
                      <>
                        <span className="text-gray-500 line-through text-sm">₹{item.oldPrice}</span>
                        <span className="text-[#D92030] text-sm">
                          {Math.round((1 - item.price / item.oldPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className={`flex-1 ${
                        item.inStock ? 'bg-[#D92030] hover:bg-[#BC1C2A]' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!item.inStock}
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="px-3" onClick={() => removeItem(item.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-md">
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="mb-8 text-gray-600">You haven't added any items to your wishlist yet.</p>
            <Button onClick={() => navigate('/')} className="bg-[#D92030] hover:bg-[#BC1C2A]">
              Continue Shopping
            </Button>
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Wishlist;
