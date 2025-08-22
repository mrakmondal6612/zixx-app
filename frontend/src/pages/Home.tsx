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
  type?: string;
}

interface Category {
  name: string;
  image: string;
  subcategories: string[] | Set<string>;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/clients/products');
        if (!res.ok) throw new Error("Failed to fetch products");
        const result = await res.json();
        if (result.ok) setProducts(result.data);
      } catch (err) {
        console.error('Error fetching all products:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/clients/products');
        if (!res.ok) throw new Error("Failed to fetch products for categories");
        const result = await res.json();
        if (result.ok) {
          const allProducts = result.data;
          const categoriesMap: { [key: string]: Category } = {};

          allProducts.forEach((product: Product) => {
            const { category, subcategory, image } = product;
            if (!categoriesMap[category]) {
              categoriesMap[category] = {
                name: category,
                image: image[0],
                subcategories: new Set<string>(),
              } as Category;
            }
            (categoriesMap[category].subcategories as Set<string>).add(subcategory);
          });

          const formatted: Category[] = Object.values(categoriesMap).map(cat => ({
            name: cat.name,
            image: cat.image,
            subcategories: Array.from(cat.subcategories as Set<string>),
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
        <Banner
          imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/d5b391a024519f0a274f617aaa8e815af74b7883?placeholderIfAbsent=true&height=900&width=2040"
          heading="Summer Collection"
          description="Light fabrics and vibrant colors for the perfect summer look."
          linkText="Shop Now"
          linkUrl="/women"
            align="bottom-left-corner"
        />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group">
                <Link to={`/women/${category.name.toLowerCase()}`} className="block">
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
                            <Link to={`/women/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>{sub}</Link>
                          </li>
                        ))
                      : Array.from(category.subcategories as Set<string>).map((sub, idx) => (
                          <li key={idx} className="hover:text-[#D92030]">
                            <Link to={`/women/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>{sub}</Link>
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
          <h2 className="text-2xl font-bold mb-8">New Arrivals</h2>
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
        )}

        {/* Featured Collection Banner */}
        <Banner
          imageUrl="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true"
            heading="Featured Collection"
            description="Explore our curated selection of the season's must-haves."
            linkText="Shop Collection"
            linkUrl="/women/featured-collection"
        />
        

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">Best Sellers</h2>
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
        )}

      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
