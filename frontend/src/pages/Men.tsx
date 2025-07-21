// ✅ Updated Men.tsx with special sections and banner
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
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
}

const Men = () => {
  const [groupedProducts, setGroupedProducts] = useState<{ [subcategory: string]: Product[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products/men');
        const result = await res.json();
        if (!result.ok) throw new Error("API returned not ok");

        const grouped: { [key: string]: Product[] } = {};
        result.data.forEach((product: Product) => {
          const sub = product.subcategory || 'Others';
          if (!grouped[sub]) grouped[sub] = [];
          grouped[sub].push(product);
        });

        setGroupedProducts(grouped);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const allProducts = Object.values(groupedProducts).flat();
  const bestSellers = allProducts.filter(p => p.theme?.toLowerCase() === 'bestseller').slice(0, 8);
  const newArrivals = allProducts.filter(p => p.theme?.toLowerCase() === 'new arrival').slice(0, 8);

  return (
    <div>
      <Header />
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">

          <Banner 
            imageUrl='https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7087fa7cadbd89e8fc148d4f01d42317d99eaccb?placeholderIfAbsent=true'
            heading="Men's Collection"
            description="Elevate your style with our versatile men's collection."
            linkText="Shop Now"
            linkUrl="/men" 
          />

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              {Object.entries(groupedProducts).map(([subcategory, products]) => (
                <section key={subcategory} className="mb-16">
                  <h3 className="text-xl font-semibold mb-4">{subcategory}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Link key={product._id} to={`/product/${product._id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square">
                            <img
                              src={product.image[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">{product.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold">₹{product.price}</span>
                              {product.discount > 0 && (
                                <span className="text-gray-500 line-through text-sm">
                                  ₹{(product.price / (1 - product.discount / 100)).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              
              {/* Best Seller */}
              {bestSellers.length > 0 && (
                <div>
                  {/* Banner */}
              <section className="mb-16">
                
                <Banner
                  imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
                  heading="Best Sellers"
                  description="Discover our most popular styles loved by our customers."
                  linkText="Shop Best Sellers"
                  linkUrl="/men/best-sellers"
                />

              </section>

              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {bestSellers.map(product => (
                      <Link key={product._id} to={`/product/${product._id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square">
                            <img src={product.image[0]} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">{product.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold">${product.price}</span>
                              {product.discount > 0 && (
                                <span className="text-gray-500 line-through text-sm">
                                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
                </div>
              )}

              {/* New Arrivals */}
              {newArrivals.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {newArrivals.map(product => (
                      <Link key={product._id} to={`/product/${product._id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square">
                            <img src={product.image[0]} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">{product.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold">${product.price}</span>
                              {product.discount > 0 && (
                                <span className="text-gray-500 line-through text-sm">
                                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
};

export default Men;
