import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Banner } from '@/components/sections/Banner';
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

const Kids = () => {
  const [groupedProducts, setGroupedProducts] = useState<{ [category: string]: { [subcategory: string]: Product[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl('/clients/products/kids'), { credentials: 'include' });
        const result = await res.json();
        if (!result.ok) throw new Error("API returned not ok");
        // console.log("result.data", result.data);
        const grouped: { [category: string]: { [subcategory: string]: Product[] } } = {};
        result.data.forEach((product: Product) => {
          const cat = product.category || 'Others';
          const sub = product.subcategory || 'Others';
          if (!grouped[cat]) grouped[cat] = {};
          if (!grouped[cat][sub]) grouped[cat][sub] = [];
          grouped[cat][sub].push(product);
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

  const allProducts = Object.values(groupedProducts).flatMap(subcategories => Object.values(subcategories).flat());
  const bestSellers = allProducts.filter(p => p.theme?.toLowerCase().includes('best')).slice(0, 8);
  const newArrivals = allProducts.filter(p => p.theme?.toLowerCase().includes('new')).slice(0, 8);
  const categoriesList = Object.keys(groupedProducts).map((cat) => {
    const subcats = Object.keys(groupedProducts[cat] || {});
    const firstSub = subcats[0];
    const firstProd = firstSub ? groupedProducts[cat][firstSub][0] : undefined;
    return {
      name: cat,
      image: firstProd?.image?.[0] || '',
      subcategories: subcats,
    };
  });
  

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Hero Banner */}
        <Banner
          imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
          heading="Playful Picks"
          description="Fun and vibrant styles for your little ones."
          linkText="Shop Now"
          linkUrl="/new-arrivals"
        />

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && Object.keys(groupedProducts).map((category, i) => (
          <section key={i} className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{category}</h2>
            {Object.keys(groupedProducts[category]).map((subcategory, j) => (
              <div key={j} className="mb-10">
                <h3 className="text-xl font-semibold mb-4">{subcategory}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {groupedProducts[category][subcategory].map((p) => (
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
              </div>
            ))}
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

        {/* Special Sections */}
        {bestSellers.length > 0 && (
        <section className="mb-16">
           {/* Banner */}
          <section className="mb-16">
            <Banner
              imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
              heading="Kids Summer Collection"
              description="Light fabrics and vibrant colors for the perfect summer look."
              linkText="Shop Now"
              linkUrl="/categories"
            />
          </section>
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
      )}

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
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Kids;
