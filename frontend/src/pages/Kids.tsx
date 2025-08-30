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
        // Strictly keep only kids items (defensive in case API returns mixed data)
        const isKidsProduct = (p: any) => {
          const g = (p?.gender || '').toString().toLowerCase();
          const c = (p?.category || '').toString().toLowerCase();
          const sc = (p?.subcategory || '').toString().toLowerCase();
          const isKid = /(kid|boy|girl)/.test(g) || /kids?/.test(c) || /kids?/.test(sc);
          const isAdult = /(women|woman|men|man|adult)/.test(g) || /(women|men|adult)/.test(c);
          return isKid && !isAdult;
        };
        const kidsOnly: Product[] = (result.data || [])
          // filter by kids predicate
          .filter((p: any) => isKidsProduct(p))
          // exclude any known misclassified IDs (safety net)
          .filter((p: any) => p?._id !== '687ddfb9331086b5654f73ac')
          // exclude products with problematic categories
          .filter((p: any) => {
            const cat = (p?.category || '').toString();
            const problematicCategories = ['Flowers', 'flowers', 'ethnic', 'Ethnic'];
            return !problematicCategories.includes(cat);
          });

        const grouped: { [category: string]: { [subcategory: string]: Product[] } } = {};
        kidsOnly.forEach((product: Product) => {
          const cat = product.category || 'Others';
          const sub = product.subcategory || 'Others';
          if (!grouped[cat]) grouped[cat] = {};
          if (!grouped[cat][sub]) grouped[cat][sub] = [];
          grouped[cat][sub].push(product);
        });

        console.log("Kids products grouped by category:", grouped);
        // Debug the Flowers category specifically
        if (grouped['Flowers']) {
          console.log("Flowers category products:", grouped['Flowers']);
          Object.keys(grouped['Flowers']).forEach(sub => {
            console.log(`Flowers -> ${sub}:`, grouped['Flowers'][sub].map(p => ({
              title: p.title,
              category: p.category,
              subcategory: p.subcategory,
              gender: p.gender
            })));
          });
        }
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
  const categoriesList = Object.keys(groupedProducts)
    .filter(cat => {
      // Remove problematic categories that don't work properly
      const problematicCategories = ['Flowers', 'flowers', 'ethnic', 'Ethnic'];
      return !problematicCategories.includes(cat);
    })
    .map((cat) => {
      const allSubs = Object.keys(groupedProducts[cat] || {});
      // keep only subcategories that actually have products
      const subcats = allSubs.filter((s) => (groupedProducts[cat][s] || []).length > 0);
      // find first product with an image across all subcategories
      let img = '';
      for (const s of subcats) {
        const arr = groupedProducts[cat][s] || [];
        const withImg = arr.find(p => Array.isArray(p.image) && p.image[0]);
        if (withImg?.image?.[0]) { img = withImg.image[0]; break; }
      }
      
      // Double-check that this category will have products when filtered on Category page
      const totalProducts = subcats.reduce((sum, s) => sum + (groupedProducts[cat][s] || []).length, 0);
      console.log(`Category "${cat}" has ${totalProducts} products across ${subcats.length} subcategories`);
      
      return {
        name: cat,
        image: img,
        subcategories: subcats,
        productCount: totalProducts,
      };
    }).filter(c => (c.subcategories && c.subcategories.length > 0 && c.productCount > 0));
  

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Hero Banner (dynamic) */}
        <DynamicBanner
          page="kids"
          position="featured"
          fallback={{
            imageUrl: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true',
            heading: 'Playful Picks',
            description: 'Fun and vibrant styles for your little ones.',
            linkText: 'Shop Now',
            linkUrl: '/new-arrivals',
          }}
          style={{ variant: 'pro', overlay: 'dark', cta: 'brand', radius: '2xl', hover: 'zoom' }}
        />

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Shop by Category (Kids) - shown first */}
        {categoriesList.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categoriesList.map((category, index) => (
                <div key={index} className="group">
                  <Link 
                    to={`/category/${encodeURIComponent(category.name.toLowerCase())}`} 
                    className="block"
                    onClick={() => { sessionStorage.setItem('kidsContext', 'true'); sessionStorage.removeItem('menContext'); }}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={category.image || `https://source.unsplash.com/featured/400x400?kid,children,${encodeURIComponent(category.name)}`}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
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
                          <Link 
                            to={`/category/${encodeURIComponent(category.name.toLowerCase())}/${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={() => { sessionStorage.setItem('kidsContext', 'true'); sessionStorage.removeItem('menContext'); }}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Kids Products */}
        {!loading && !error && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">All Kids Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {allProducts.map((p) => (
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
        )}

        {/* Special Sections */}
        <section className="mb-16">
          {/* Best Sellers Banner always visible */}
            </section>
          <section className="mb-16">
        {bestSellers.length > 0 && (
          <>
            <DynamicBanner
              page="kids"
              position="best"
              fallback={{
                imageUrl: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true',
                heading: 'Kids Summer Collection',
                description: 'Light fabrics and vibrant colors for the perfect summer look.',
                linkText: 'Shop Now',
                linkUrl: '/categories',
              }}
              style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
            />
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
            </>
          )}
        </section>

        <section className="mb-16">
          {newArrivals.length > 0 && (
            <>
          <DynamicBanner
            page="kids"
            position="new"
            fallback={{
              imageUrl: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true',
              heading: 'New Arrivals',
              description: 'Fresh styles for kids just in.',
              linkText: 'Shop New',
              linkUrl: '/new-arrivals',
            }}
            style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
          />
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
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Kids;
