import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ReviewSection } from '@/components/ReviewSection';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Banner } from '@/components/sections/Banner';

interface Product {
  _id: string;
  title: string;
  price: number;
  discount: number;
  rating: string;
  category: string;
  subcategory: string;
  gender: string;
  theme: string;
  size: string;
  image: string[];
  type?: string;
}

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error("Failed to fetch products");
        const result = await res.json();
        if (result.ok) {
          const filtered = result.data.filter((product: Product) =>
            product.theme?.toLowerCase().includes('new')
          );
          setNewArrivals(filtered);
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <Banner
        imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
        heading="New Arrivals"
        description="Discover the latest trends and styles in our new arrivals collection."
        linkText="Shop Now"
        linkUrl="/new-arrivals"
        align="middle-bottom"
      />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10"> 
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">New Arrivals</h1>
          <p className="text-xl text-gray-600 mb-8">Discover the latest trends and styles</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <Link key={product._id} to={`/product/${product._id}`}>
                <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square">
                    <img src={product.image[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.subcategory}</p>
                    <div className="font-bold text-[#D92030]">${product.price}</div>
                    {product.discount > 0 && (
                      <div className="text-gray-500 line-through text-sm">
                        ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
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
