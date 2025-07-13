
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Button } from '@/components/ui/button';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tracking order:', { orderNumber, email });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Track Your Order</h1>
          <p className="text-gray-600 mb-8">Enter your order details to track your package</p>
          
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D92030] focus:outline-none"
                placeholder="Enter your order number"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D92030] focus:outline-none"
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#D92030] hover:bg-[#BC1C2A] py-3"
            >
              Track Order
            </Button>
          </form>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <p className="text-gray-600 text-sm">
              If you have any questions about your order, please contact our customer service team.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
