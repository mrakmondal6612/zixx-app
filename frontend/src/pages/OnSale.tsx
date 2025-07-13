
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';

const OnSale = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 text-[#D92030]">On Sale</h1>
          <p className="text-xl text-gray-600 mb-8">Amazing deals and discounts on your favorite items</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <div className="text-2xl font-bold text-[#D92030] mb-2">Up to 50% OFF</div>
              <h3 className="text-xl font-semibold mb-4">Women's Sale</h3>
              <p className="text-gray-600">Limited time offer on selected items</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">Up to 40% OFF</div>
              <h3 className="text-xl font-semibold mb-4">Men's Sale</h3>
              <p className="text-gray-600">Exclusive discounts on men's collection</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">Up to 60% OFF</div>
              <h3 className="text-xl font-semibold mb-4">Kids Sale</h3>
              <p className="text-gray-600">Special prices for kids' clothing</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OnSale;
