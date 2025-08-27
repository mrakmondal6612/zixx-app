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

interface CategoryGroup {
  category: string;
  subcategory: string;
  image: string;
}

const Women = () => {
  const [groupedProducts, setGroupedProducts] = useState<{ [category: string]: { [subcategory: string]: Product[] } }>({});
  const [allData, setAllData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl('/clients/products/women'), { credentials: 'include' });
        const result = await res.json();
        console.log("Fetched products:", result.data);
        if (!result.ok) throw new Error("API returned not ok");

        const grouped: { [category: string]: { [subcategory: string]: Product[] } } = {};
        result.data.forEach((product: Product) => {
          const cat = product.category || 'Others';
          const sub = product.subcategory || 'Others';
          if (!grouped[cat]) grouped[cat] = {};
          if (!grouped[cat][sub]) grouped[cat][sub] = [];
          grouped[cat][sub].push(product);
        });

        setGroupedProducts(grouped);
        setAllData(result.data);

        // Prepare unique category + subcategory list
        const imageMap: { [key: string]: string } = {
          tops: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true',
          bottoms: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true',
          dresses: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true',
          outerwear: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true',
        };

        const catList: CategoryGroup[] = [];
        result.data.forEach((product: Product) => {
          if (!catList.some(c => c.category === product.category && c.subcategory === product.subcategory)) {
            catList.push({
              category: product.category,
              subcategory: product.subcategory,
              image: imageMap[product.category.toLowerCase()] || product.image[0],
            });
          }
        });

        setCategories(catList);
        setLoading(false);
      } catch (err: any) {
        console.log("err", err);
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const bestSellers = allData.filter(p => p.theme?.toLowerCase().includes('new'));
  const newArrivals = allData.filter(p => p.theme?.toLowerCase().includes('new'));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
      <DynamicBanner
        page="women"
        position="featured"
        fallback={{
          imageUrl: "/placeholder.svg",
          heading: "Featured Collection",
          description: "Explore our curated selection of the season's must-haves.",
          linkText: "Shop Collection",
          linkUrl: "/women",
        }}
        style={{ variant: 'pro', overlay: 'dark', cta: 'brand', radius: '2xl', hover: 'zoom' }}
      />
        {/* Category Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group">
                <Link to={`/category/${category.category.toLowerCase()}`}>
                  <Card className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={category.image}
                        alt={category.category} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <h3 className="text-white text-xl font-bold">{category.category.toUpperCase()}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>

                <div className="mt-3">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="hover:text-[#D92030]">
                      <Link to={`/category/${category.category.toLowerCase()}/${category.subcategory.toLowerCase()}`}>
                        {category.subcategory}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && Object.keys(groupedProducts).map((category, i) => (
          <section key={i} className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{category.toUpperCase()}</h2>
            {Object.keys(groupedProducts[category]).map((subcategory, j) => (
              <div key={j} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{subcategory}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {groupedProducts[category][subcategory].slice(0, 4).map((p, index) => (
                    <ProductCard
                      key={index}
                      id={p._id}
                      title={p.title}
                      image={p.image?.[0]}
                      price={p.price}
                      discount={p.discount}
                      badge={p.theme?.toLowerCase().includes('best') ? 'Best Seller' : p.theme?.toLowerCase().includes('new') ? 'New Arrival' : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}


        {/* Special Sections: Best Seller & New Arrival */}

        {bestSellers.length > 0 && (
          <section className="mb-16">
            {/* Banner */}
            <section className="mb-16">
              
              <DynamicBanner
                page="women"
                position="summer"
                fallback={{
                  imageUrl: '/placeholder.svg',
                  heading: "Summer Collection",
                  description: "Light fabrics and vibrant colors for the perfect summer look.",
                  linkText: "Shop Now",
                  linkUrl: "/women",
                }}
                style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
              />
            </section>
        
          <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {bestSellers.slice(0, 8).map((p) => (
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
        )}

        {newArrivals.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {newArrivals.map((p) => (
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

      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Women;
