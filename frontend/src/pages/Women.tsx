
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const Women = () => {
  const categories = [
    { 
      name: "Tops", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true",
      subcategories: ["T-Shirts", "Blouses", "Sweaters", "Shirts"]
    },
    { 
      name: "Bottoms", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true",
      subcategories: ["Jeans", "Pants", "Shorts", "Skirts"]
    },
    { 
      name: "Dresses", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true",
      subcategories: ["Casual", "Formal", "Maxi", "Mini"]
    },
    { 
      name: "Outerwear", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true",
      subcategories: ["Jackets", "Coats", "Cardigans"]
    }
  ];

  const products = [
    {
      id: "1",
      name: "Fitted Cotton T-Shirt",
      price: 19.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true",
    },
    {
      id: "2",
      name: "Relaxed Fit Jeans",
      price: 49.99,
      oldPrice: 69.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true",
    },
    {
      id: "3",
      name: "Floral Print Dress",
      price: 59.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true",
    },
    {
      id: "4",
      name: "Denim Jacket",
      price: 79.99,
      oldPrice: 99.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true",
    },
    {
      id: "5",
      name: "Knit Sweater",
      price: 44.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true",
    },
    {
      id: "6",
      name: "Wide Leg Pants",
      price: 39.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/1ae9ee2293ad29eef209760dacb27c2cfcc587ac?placeholderIfAbsent=true",
    },
    {
      id: "7",
      name: "Button-Up Blouse",
      price: 34.99,
      oldPrice: 44.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true",
    },
    {
      id: "8",
      name: "Pleated Skirt",
      price: 29.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7087fa7cadbd89e8fc148d4f01d42317d99eaccb?placeholderIfAbsent=true",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/d5b391a024519f0a274f617aaa8e815af74b7883?placeholderIfAbsent=true" 
            alt="Women's Collection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Women's Collection</h1>
            <p className="text-lg md:text-xl max-w-2xl text-center">Discover the latest trends and timeless classics in our women's collection.</p>
          </div>
        </div>
        
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to={`/women/${category.name.toLowerCase()}`} className="group">
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
                <div className="mt-3">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {category.subcategories.map((sub, idx) => (
                      <li key={idx} className="hover:text-[#D92030]">
                        <Link to={`/women/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* New Arrivals Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">New Arrivals</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">${product.price}</span>
                      {product.oldPrice && (
                        <span className="text-gray-500 line-through text-sm">${product.oldPrice}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Featured Collection Banner */}
        <section className="mb-16">
          <div className="relative w-full h-[200px] md:h-[300px] rounded-lg overflow-hidden">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true" 
              alt="Summer Collection" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Summer Collection</h2>
              <p className="text-white max-w-md mb-6">Light fabrics and vibrant colors for the perfect summer look.</p>
              <Link to="/women/summer-collection" className="bg-white text-black px-6 py-2 rounded-md inline-block font-medium hover:bg-gray-100 transition-colors w-max">
                Shop Now
              </Link>
            </div>
          </div>
        </section>
        
        {/* Best Sellers Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Best Sellers</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.slice(4, 8).map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">${product.price}</span>
                      {product.oldPrice && (
                        <span className="text-gray-500 line-through text-sm">${product.oldPrice}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Women;
