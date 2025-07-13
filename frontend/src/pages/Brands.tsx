
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

type Brand = {
  id: string;
  name: string;
  logo: string;
  featured: boolean;
};

const Brands = () => {
  const brands: Brand[] = [
    {
      id: '1',
      name: 'ZIXX',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7cca860fedc8680dd550e361a158b91fff3bb621?placeholderIfAbsent=true',
      featured: true
    },
    {
      id: '2',
      name: 'Urban Core',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true',
      featured: true
    },
    {
      id: '3',
      name: 'Street Vision',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true',
      featured: false
    },
    {
      id: '4',
      name: 'Modern Edge',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true',
      featured: false
    },
    {
      id: '5',
      name: 'Urban Collective',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true',
      featured: false
    },
    {
      id: '6',
      name: 'Fresh Threads',
      logo: 'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true',
      featured: false
    }
  ];

  const featuredBrands = brands.filter(brand => brand.featured);
  const alphabeticalBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Our Brands</h1>
        
        {/* Featured Brands */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Featured Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredBrands.map(brand => (
              <Link key={brand.id} to={`/brands/${brand.id}`}>
                <Card className="h-40 flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                  <div className="w-full aspect-square relative">
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="absolute inset-0 w-full h-full object-contain" 
                    />
                  </div>
                </Card>
                <p className="text-center mt-2 font-medium">{brand.name}</p>
              </Link>
            ))}
          </div>
        </section>
        
        {/* All Brands (A-Z) */}
        <section>
          <h2 className="text-xl font-bold mb-6">All Brands (A-Z)</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {alphabeticalBrands.map(brand => (
              <Link key={brand.id} to={`/brands/${brand.id}`}>
                <Card className="h-40 flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                  <div className="w-full aspect-square relative">
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="absolute inset-0 w-full h-full object-contain" 
                    />
                  </div>
                </Card>
                <p className="text-center mt-2 font-medium">{brand.name}</p>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg p-4">
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                <a 
                  key={letter}
                  href={`#${letter}`}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Brands;
