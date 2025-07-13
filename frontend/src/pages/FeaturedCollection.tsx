
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const FeaturedCollection = () => {
  const featuredItems = [
    {
      id: 1,
      name: 'Premium Cotton Shirt',
      price: 79.99,
      oldPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&h=500',
      rating: 4.8,
      reviews: 124,
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Designer Denim Jacket',
      price: 129.99,
      oldPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&h=500',
      rating: 4.9,
      reviews: 89,
      badge: 'Editor\'s Choice'
    },
    {
      id: 3,
      name: 'Silk Blend Dress',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&h=500',
      rating: 4.7,
      reviews: 76,
      badge: 'New Arrival'
    },
    {
      id: 4,
      name: 'Cashmere Sweater',
      price: 199.99,
      oldPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&h=500',
      rating: 4.9,
      reviews: 156,
      badge: 'Limited Edition'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Featured Collection</h1>
          <p className="text-gray-600 text-lg">Handpicked premium pieces from our latest collection</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredItems.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#D92030] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {item.badge}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#D92030]">${item.price}</span>
                    {item.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">${item.oldPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FeaturedCollection;
