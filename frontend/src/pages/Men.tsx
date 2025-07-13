
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const Men = () => {
  const categories = [
    { 
      name: "Tops", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true",
      subcategories: ["T-Shirts", "Shirts", "Polos", "Hoodies"]
    },
    { 
      name: "Bottoms", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/eb643d7fe0ae4338ccb6e5788c39e2bcd9311740?placeholderIfAbsent=true",
      subcategories: ["Jeans", "Chinos", "Shorts", "Track Pants"]
    },
    { 
      name: "Outerwear", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true",
      subcategories: ["Jackets", "Coats", "Vests"]
    },
    { 
      name: "Accessories", 
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/e0f1ccf92e2dce8c07fc31ea713741f0624b1ac9?placeholderIfAbsent=true",
      subcategories: ["Caps", "Bags", "Belts", "Socks"]
    }
  ];

  const products = [
    {
      id: "1",
      name: "Oversized Tee",
      price: 29.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true",
    },
    {
      id: "2",
      name: "Classic Fit Jeans",
      price: 59.99,
      oldPrice: 79.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/eb643d7fe0ae4338ccb6e5788c39e2bcd9311740?placeholderIfAbsent=true",
    },
    {
      id: "3",
      name: "Bomber Jacket",
      price: 89.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true",
    },
    {
      id: "4",
      name: "Trucker Cap",
      price: 19.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/e0f1ccf92e2dce8c07fc31ea713741f0624b1ac9?placeholderIfAbsent=true",
    },
    {
      id: "5",
      name: "Oxford Shirt",
      price: 49.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true",
    },
    {
      id: "6",
      name: "Cargo Shorts",
      price: 39.99,
      oldPrice: 49.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true",
    },
    {
      id: "7",
      name: "Hoodie",
      price: 54.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7087fa7cadbd89e8fc148d4f01d42317d99eaccb?placeholderIfAbsent=true",
    },
    {
      id: "8",
      name: "Slim Fit Chinos",
      price: 44.99,
      image: "https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true",
    }
  ];

  return (
    <div>
      <Header />
    <div className="flex flex-col min-h-screen bg-white">
      
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7087fa7cadbd89e8fc148d4f01d42317d99eaccb?placeholderIfAbsent=true" 
            alt="Men's Collection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Men's Collection</h1>
            <p className="text-lg md:text-xl max-w-2xl text-center">Elevate your style with our versatile men's collection.</p>
          </div>
        </div>
        
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to={`/men/${category.name.toLowerCase()}`} className="group">
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
                        <Link to={`/men/${category.name.toLowerCase()}/${sub.toLowerCase()}`}>
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
        
        {/* Hot Boy Fit Banner */}
        <section className="mb-16">
          <div className="relative w-full h-[200px] md:h-[300px] rounded-lg overflow-hidden">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/4aced3c27c234d70267aacc0142add1478e2c868?placeholderIfAbsent=true" 
              alt="Hot Boy Fit" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Hot Boy Fit</h2>
              <p className="text-white max-w-md mb-6">Get the perfect streetwear look with our curated collection.</p>
              <Link to="/men/hot-boy-fit" className="bg-[#D92030] text-white px-6 py-2 rounded-md inline-block font-medium hover:bg-[#BC1C2A] transition-colors w-max">
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
    </div>
  );
};

export default Men;
