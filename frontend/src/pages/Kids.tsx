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

const Kids = () => {
  const [groupedProducts, setGroupedProducts] = useState<{ [category: string]: { [subcategory: string]: Product[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
  const res = await fetch('/clients/products/kids');
        const result = await res.json();
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
  const bestSellers = allProducts.filter(p => p.theme?.toLowerCase() === 'bestseller').slice(0, 8);
  const newArrivals = allProducts.filter(p => p.theme?.toLowerCase() === 'new arrival').slice(0, 8);
  

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
          linkUrl="/kids/playful-picks"
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
                  {groupedProducts[category][subcategory].map((product) => (
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
              </div>
            ))}
          </section>
        ))}

        {/* Banner */}
        <section className="mb-16">
          <Banner
            imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
            heading="Kids Summer Collection"
            description="Light fabrics and vibrant colors for the perfect summer look."
            linkText="Shop Now"
            linkUrl="/kids/summer-collection"
          />
        </section>

        {/* Special Sections */}
        {bestSellers.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Object.values(groupedProducts)
              .flatMap((subcategories) => Object.values(subcategories).flat())
              .filter((product) => product.theme?.toLowerCase() === 'bestseller')
              .slice(0, 8)
              .map((product) => (
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

      {newArrivals.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Object.values(groupedProducts)
              .flatMap((subcategories) => Object.values(subcategories).flat())
              .filter((product) => product.theme?.toLowerCase() === 'new arrival')
              .slice(0, 8)
              .map((product) => (
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
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Kids;
