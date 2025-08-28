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
  description: string;
  brand: string;
  image: string[];
  type?: string;
  stat?: any;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  supply?: number;
  stock?: number;
  color?: string;
}

interface Category {
  name: string;
  image: string;
  subcategories: string[];
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl('/clients/products'), { credentials: 'include' } );
        if (!res.ok) throw new Error("Failed to fetch products");
        const result = await res.json();
        if (result.ok) setProducts(result.data);
      } catch (err) {
        console.error('Error fetching all products:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(apiUrl('/clients/products'), { credentials: 'include' } );
        if (!res.ok) throw new Error("Failed to fetch products for categories");
        const result = await res.json();
        if (result.ok) {
          const allProducts: Product[] = result.data;
          const categoriesMap: { [key: string]: { name: string; image: string; subcategories: Set<string> } } = {};
          allProducts.forEach((product: Product) => {
            const { category, subcategory, image } = product;
            if (!categoriesMap[category]) {
              categoriesMap[category] = {
                name: category,
                image: image?.[0] || '',
                subcategories: new Set<string>(),
              };
            }
            if (subcategory) categoriesMap[category].subcategories.add(subcategory);
          });

          const formatted: Category[] = Object.values(categoriesMap).map(cat => ({
            name: cat.name,
            image: cat.image,
            subcategories: Array.from(cat.subcategories),
          }));

          setCategories(formatted);
        }
      } catch (err) {
        console.error('Error generating categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);
 
  const newArrivals = products.filter(p => p.theme?.toLowerCase().includes('new'));
  const bestSellers = products.filter(p => p.theme?.toLowerCase().includes('best'));
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <DynamicBanner
          page="home"
          position="hero"
          fallback={{
            imageUrl: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7087fa7cadbd89e8fc148d4f01d42317d99eaccb?placeholderIfAbsent=true",
            heading: "Summer Collection",
            description: "Light fabrics and vibrant colors for the perfect summer look.",
            linkText: "Shop Now",
            linkUrl: "/women",
          }}
          style={{ variant: 'pro', overlay: 'dark', cta: 'brand', radius: '2xl', hover: 'zoom' }}
        />
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group">
                <Link to={`/category/${category.name.toLowerCase()}`} className="block">
                  <Card className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={category.image}
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
                    {Array.isArray(category.subcategories)
                      ? category.subcategories.map((sub, idx) => (
                          <li key={idx} className="hover:text-[#D92030]">
                            <Link to={`/category/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>{sub}</Link>
                          </li>
                        ))
                      : Array.from(category.subcategories as Set<string>).map((sub, idx) => (
                          <li key={idx} className="hover:text-[#D92030]">
                            <Link to={`/category/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>{sub}</Link>
                          </li>
                        ))
                    }
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
        <section className="mb-16">
          <DynamicBanner
            page="home"
            position="new-arrivals"
            fallback={{
              imageUrl: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true",
              heading: "Summer Collection",
              description: "Light fabrics and vibrant colors for the perfect summer look.",
              linkText: "Shop Now",
              linkUrl: "/women",
            }}
            style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
          />
          <h2 className="text-2xl font-bold mb-8">New Arrivals</h2>
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

        {/* Featured Collection Banner */}
        <DynamicBanner
          page="home"
          position="featured"
          fallback={{
            imageUrl: "https://res.cloudinary.com/dxtle1heo/image/upload/v1756038296/profile_pics/gatpp49d6jwhb9q2l6yv.png",
            heading: "Featured Collection",
            description: "Explore our curated selection of the season's must-haves.",
            linkText: "Shop Collection",
            linkUrl: "/men",
          }}
          style={{ variant: 'pro', overlay: 'dark', cta: 'neutral', radius: '2xl', hover: 'zoom' }}
        />
        

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Best Sellers</h2>
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


        <DynamicBanner
          page="home"
          position="men-promo"
          fallback={{
            imageUrl: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/d5b391a024519f0a274f617aaa8e815af74b7883?placeholderIfAbsent=true',
            heading: "Men's Collection",
            description: "Elevate your style with our versatile men's collection.",
            linkText: "Shop Now",
            linkUrl: "/men",
          }}
          style={{ variant: 'pro', overlay: 'dark', cta: 'brand', radius: '2xl', hover: 'zoom' }}
        />

          {products.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8">All Collection</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.map(p => (
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


      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
