
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

type Brand = {
  name: string;
  logo: string;
};


const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
  const res = await fetch('/clients/brands');
        const data = await res.json();
        if (data.ok && Array.isArray(data.data)) {
          setBrands(data.data);
        } else {
          setError(data.message || 'Failed to fetch brands');
        }
      } catch (err) {
        setError('Failed to fetch brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const alphabeticalBrands = [...brands]
    .filter((brand) => brand.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Our Brands</h1>
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92030]"
          />
        </div>
        {loading ? (
          <div className="text-center py-10">Loading brands...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <section>
            <h2 className="text-xl font-bold mb-6">All Brands (A-Z)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {alphabeticalBrands.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No brands found.</div>
              ) : (
                alphabeticalBrands.map((brand) => (
                  <Link key={brand.name} to={`/brands/${encodeURIComponent(brand.name)}`}>
                    <Card className="h-40 flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                      <div className="w-full aspect-square relative">
                        <img
                          src={brand.logo || "/placeholder.svg"}
                          alt={brand.name}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-center mt-2 font-medium w-full">{brand.name}</p>
                    </Card>
                  </Link>
                ))
              )}
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
