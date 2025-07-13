
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ReviewSection } from '@/components/ReviewSection';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const NewArrivals = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">New Arrivals</h1>
          <p className="text-xl text-gray-600 mb-8">Discover the latest trends and styles</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">New Product {item}</h3>
                  <p className="text-gray-600 text-sm mb-2">Latest fashion trend</p>
                  <div className="font-bold text-[#D92030]">$99.99</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Reviews Section */}
          <div className="mt-16">
            <ReviewSection />
          </div>
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default NewArrivals;
