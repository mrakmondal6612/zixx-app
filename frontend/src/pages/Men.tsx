// ✅ Updated Men.tsx with special sections and banner
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { DynamicBanner } from '@/components/sections/DynamicBanner';
import { apiUrl } from '@lib/api';

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
        const res = await fetch(apiUrl('/clients/products/men'), { credentials: 'include' });
        console.log(res);
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
  const bestSellers = allProducts.filter(p => p.theme?.toLowerCase().includes('best')).slice(0, 8);
  const newArrivals = allProducts.filter(p => p.theme?.toLowerCase().includes('new')).slice(0, 8);
  // Build proper category -> subcategories mapping from products
  const categoriesMap: Record<string, { image: string; subcategories: Set<string> }> = {};
  allProducts.forEach((p) => {
    const cat = p.category || 'Others';
    const sub = p.subcategory || 'Others';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { image: p.image?.[0] || '', subcategories: new Set<string>() };
    }
    categoriesMap[cat].subcategories.add(sub);
  });
  const categoriesList = Object.entries(categoriesMap).map(([name, data]) => ({
    name,
    image: data.image,
    subcategories: Array.from(data.subcategories),
  }));

  return (
    <div>
      <Header />
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">

          <DynamicBanner
            page="men"
            position="hero"
            fallback={{
              imageUrl: '/placeholder.svg',
              heading: "Men's Collection",
              description: "Elevate your style with our versatile men's collection.",
              linkText: "Shop Now",
              linkUrl: "/categories/clothes?gender=men",
            }}
            style={{ variant: 'pro', overlay: 'dark', cta: 'brand', radius: '2xl', hover: 'zoom' }}
          />

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              {Object.entries(groupedProducts).map(([subcategory, products]) => (
                <section key={subcategory} className="mb-16">
                  <h3 className="text-xl font-semibold mb-4">{subcategory}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {products.map((p) => (
                      <ProductCard
                        key={p._id}
                        id={p._id}
                        title={p.title}
                        image={p.image?.[0]}
                        price={p.price}
                        discount={p.discount}
                        badge={p.theme?.toLowerCase().includes('best') ? 'Best Seller' : p.theme?.toLowerCase().includes('new') ? 'New Arrival' : undefined}
                      />
                    ))}
                  </div>
                </section>
              ))}

              
              {/* Shop by Category */}
              {categoriesList.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categoriesList.map((category, index) => (
                      <div key={index} className="group">
                        <Link to={`/category/${encodeURIComponent(category.name.toLowerCase())}`} className="block">
                          <Card className="overflow-hidden">
                            <div className="aspect-square relative">
                              <img
                                src={category.image || '/placeholder.svg'}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                <h3 className="text-white text-xl font-bold">{category.name}</h3>
                              </div>
                            </div>
                          </Card>
                        </Link>
                        <div className="mt-3">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {category.subcategories.map((sub, idx) => (
                              <li key={idx} className="hover:text-[#D92030]">
                                <Link to={`/category/${encodeURIComponent(category.name.toLowerCase())}/${encodeURIComponent(sub.toLowerCase())}`}>{sub}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Best Seller */}
              {bestSellers.length > 0 && (
                <div>
                  {/* Banner */}
              <section className="mb-16">
                
                <DynamicBanner
                  page="men"
                  position="best"
                  fallback={{
                    imageUrl: "/placeholder.svg",
                    heading: "Best Sellers",
                    description: "Discover our most popular styles loved by our customers.",
                    linkText: "Shop Best Sellers",
                    linkUrl: "/categories",
                  }}
                  style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
                />

              </section>

              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {bestSellers.map(p => (
                      <ProductCard
                        key={p._id}
                        id={p._id}
                        title={p.title}
                        image={p.image?.[0]}
                        price={p.price}
                        discount={p.discount}
                        badge={'Best Seller'}
                      />
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
                    {newArrivals.map(p => (
                      <ProductCard
                        key={p._id}
                        id={p._id}
                        title={p.title}
                        image={p.image?.[0]}
                        price={p.price}
                        discount={p.discount}
                        badge={'New Arrival'}
                      />
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
