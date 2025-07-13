
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';

const Collections = () => {
  const collections = [
    { 
      name: 'Summer Vibes', 
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&h=400', 
      description: 'Light and breezy outfits for the perfect summer',
      items: '25 items'
    },
    { 
      name: 'Urban Street', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&h=400', 
      description: 'Edgy streetwear for the modern urbanite',
      items: '30 items'
    },
    { 
      name: 'Classic Elegance', 
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&h=400', 
      description: 'Timeless pieces that never go out of style',
      items: '20 items'
    },
    { 
      name: 'Weekend Casual', 
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&h=400', 
      description: 'Comfortable and stylish weekend wear',
      items: '35 items'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Collections</h1>
          <p className="text-gray-600 text-lg">Curated collections for every style and occasion</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <Link key={index} to={`/shop?collection=${collection.name.toLowerCase().replace(' ', '-')}`} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                  <p className="text-gray-600 mb-3">{collection.description}</p>
                  <p className="text-[#D92030] font-semibold">{collection.items}</p>
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

export default Collections;
