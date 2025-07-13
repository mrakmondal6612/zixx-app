
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';

const Accessories = () => {
  const accessories = [
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&h=400', count: '45+ items' },
    { name: 'Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&h=400', count: '60+ items' },
    { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&h=400', count: '80+ items' },
    { name: 'Sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400', count: '35+ items' },
    { name: 'Belts', image: 'https://images.unsplash.com/photo-1553721994-1ab990d09b51?auto=format&fit=crop&w=400&h=400', count: '25+ items' },
    { name: 'Hats', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&h=400', count: '40+ items' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Accessories Collection</h1>
          <p className="text-gray-600 text-lg">Complete your look with our premium accessories</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {accessories.map((accessory, index) => (
            <Link key={index} to={`/shop?category=${accessory.name.toLowerCase()}`} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={accessory.image} 
                    alt={accessory.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{accessory.name}</h3>
                  <p className="text-gray-600">{accessory.count}</p>
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

export default Accessories;
