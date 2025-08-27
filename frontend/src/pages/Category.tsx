import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { apiUrl } from '@lib/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  discount: number;
  rating?: string | number;
  category: string;
  subcategory?: string;
  gender?: string;
  theme?: string;
  size?: string | string[];
  image: string[];
  brand?: string;
}

const CategoryPage: React.FC = () => {
  const { category = '', subcategory = '' } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(apiUrl('/clients/products'), { credentials: 'include' } );
        const result = await res.json();
        if (!result.ok) throw new Error(result.message || 'Failed to fetch');
        setProducts(result.data as Product[]);
        setLoading(false);
      } catch (e: any) {
        setError(e.message || 'Error fetching products');
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // SEO title
  useEffect(() => {
    const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    document.title = subcategory
      ? `${cap(subcategory)} | ${cap(category)} — Shop`
      : `${cap(category)} — Shop`;
  }, [category, subcategory]);

  // Helper: normalize tokens to improve matching across minor naming differences
  const normalize = (v?: string) => {
    if (!v) return '';
    const base = v
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ');
    // alias map for common variants
    const aliases: Record<string, string> = {
      clothing: 'clothes',
      apparel: 'clothes',
      accessory: 'accessories',
      'featured collection': 'featured',
      toprated: 'top-rated',
      'top rated': 'top-rated',
    };
    if (aliases[base]) return aliases[base];
    // plural trim (keep words like 'clothes' intact)
    if (base.endsWith('s') && base !== 'clothes') return base.slice(0, -1);
    return base;
  };

  const normalizedCategory = normalize(category);
  const normalizedSub = normalize(subcategory);

  const filteredByCategory = useMemo(() => {
    // Special collection for pseudo-category routes
    if (normalizedCategory === 'top-rated') {
      const withRatings = products
        .map(p => ({ p, r: Number((p as any).rating || 0) }))
        .filter(item => !Number.isNaN(item.r) && item.r > 0);
      // Threshold can be tuned; show best first
      return withRatings
        .filter(item => item.r >= 4)
        .sort((a, b) => b.r - a.r)
        .map(item => item.p);
    }
    // Default: match real category exactly
    return products.filter(p => normalize(p.category) === normalizedCategory);
  }, [products, normalizedCategory]);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    filteredByCategory.forEach(p => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return Array.from(set).sort();
  }, [filteredByCategory]);

  // sort/filter state
  const [sortBy, setSortBy] = useState<'relevance'|'price-asc'|'price-desc'>('relevance');
  // Radix Select requires non-empty item values; use 'all' sentinel instead of ''
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Initialize brand from URL (?brand=...) and keep in sync when URL changes (e.g., back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandParam = params.get('brand');
    const next = brandParam && brandParam.trim() !== '' ? brandParam : 'all';
    // Avoid unnecessary state updates
    setSelectedBrand(prev => (prev === next ? prev : next));
  }, [location.search]);

  // When brand changes via UI, reflect it in the URL query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const current = params.get('brand') || 'all';
    const desired = selectedBrand || 'all';
    if (current === desired) return;
    if (desired === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', desired);
    }
    const qs = params.toString();
    const path = `/category/${encodeURIComponent((category || '').toLowerCase())}${normalizedSub ? `/${encodeURIComponent(normalizedSub)}` : ''}`;
    navigate(qs ? `${path}?${qs}` : path, { replace: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand]);

  const filteredProducts = useMemo(() => {
    let list = !normalizedSub
      ? filteredByCategory
      : filteredByCategory.filter(p => normalize(p.subcategory) === normalizedSub);
    // brand filter (skip when 'all')
    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter(p => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase());
    }
    // sort
    if (sortBy === 'price-asc') list = [...list].sort((a,b) => (a.price||0) - (b.price||0));
    if (sortBy === 'price-desc') list = [...list].sort((a,b) => (b.price||0) - (a.price||0));
    return list;
  }, [filteredByCategory, normalizedSub, selectedBrand, sortBy]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    filteredByCategory.forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set).sort();
  }, [filteredByCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold capitalize">{decodedURIComponentSafe(category)}</h1>
          {subcategory && (
            <p className="text-muted-foreground capitalize">Subcategory: {decodedURIComponentSafe(subcategory)}</p>
          )}
        </div>

        {/* Subcategory navigation */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/category/${encodeURIComponent(normalizedCategory)}`}
                className={`px-3 py-1 rounded-full text-sm border ${!normalizedSub ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
              >
                All
              </Link>
              {subcategories.map((sub) => (
                <Link
                  key={sub}
                  to={`/category/${encodeURIComponent(normalizedCategory)}/${encodeURIComponent(sub.toLowerCase())}`}
                  className={`px-3 py-1 rounded-full text-sm border ${normalizedSub === sub.toLowerCase() ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBrand !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedBrand('all')}>Clear brand</Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{filteredProducts.length} items</div>
        </div>

        {/* Grid */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-muted-foreground">No products found.</div>
        ) : (
          <section className="mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
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

function decodedURIComponentSafe(v?: string) {
  if (!v) return '';
  try { return decodeURIComponent(v); } catch { return v; }
}

export default CategoryPage;
