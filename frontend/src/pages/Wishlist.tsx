
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  size?: string;
  color?: string;
  inStock: boolean;
};

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'ZIXX Classic Fit T-shirt',
      price: 49.99,
      oldPrice: 69.99,
      image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true',
      size: 'XL',
      color: 'Gray',
      inStock: true
    },
    {
      id: '2',
      name: 'ZIXX Oversized Tee',
      price: 39.99,
      image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true',
      size: 'L',
      color: 'Black',
      inStock: true
    },
    {
      id: '3',
      name: 'Vertical Striped Shirt',
      price: 29.99,
      oldPrice: 44.99,
      image: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true',
      size: 'M',
      color: 'Multi',
      inStock: false
    }
  ]);

  const removeItem = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Wishlist</h1>
        
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
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
                    <span className="font-bold">${item.price}</span>
                    {item.oldPrice && (
                      <span className="text-gray-500 line-through text-sm">${item.oldPrice}</span>
                    )}
                    {item.oldPrice && (
                      <span className="text-[#D92030] text-sm">
                        {Math.round((1 - item.price / item.oldPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className={`flex-1 ${item.inStock ? 'bg-[#D92030] hover:bg-[#BC1C2A]' : 'bg-gray-300 cursor-not-allowed'}`}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-3"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-md bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="mb-8 text-gray-600">You haven't added any items to your wishlist yet.</p>
            <Button className="bg-[#D92030] hover:bg-[#BC1C2A]">Continue Shopping</Button>
          </div>
        )}
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Wishlist;
