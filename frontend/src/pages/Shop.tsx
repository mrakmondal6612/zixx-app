import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import CategoryFilters from '@/components/sections/CategoryFilters';
import { fetchProducts, type Product, type ProductQuery } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

const Shop = () => {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters and data state
  const [filters, setFilters] = useState<{ sizes: string[]; colors: string[]; priceMin?: number; priceMax?: number; sort?: string }>({ sizes: [], colors: [], sort: 'relevance' });
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL on mount
  useEffect(() => {
    const sizes = (searchParams.get('sizes') || '').split(',').filter(Boolean);
    const colors = (searchParams.get('colors') || '').split(',').filter(Boolean);
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const sort = searchParams.get('sort') || 'relevance';
    const p = Number(searchParams.get('page') || '1');
    const lim = Number(searchParams.get('limit') || '24');
    setFilters({
      sizes,
      colors,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      sort,
    });
    setPage(isNaN(p) || p < 1 ? 1 : p);
    setLimit(isNaN(lim) || lim < 1 ? 24 : lim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build query (no fixed category to include all products)
  const query: ProductQuery = useMemo(() => ({
    sizes: filters.sizes.map((s) => s.toLowerCase()),
    colors: filters.colors.map((c) => c.toLowerCase()),
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sort: filters.sort as any,
    page,
    limit,
  }), [filters, page, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts(query);
      setItems(res.data);
      setTotal(res.total);
      setPage(res.page);
      setLimit(res.limit);
    } catch (e: any) {
      setError(e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  // When filters change, reset to page 1 and push to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.sizes.length) params.sizes = filters.sizes.join(',');
    if (filters.colors.length) params.colors = filters.colors.join(',');
    if (filters.priceMin !== undefined) params.priceMin = String(filters.priceMin);
    if (filters.priceMax !== undefined) params.priceMax = String(filters.priceMax);
    if (filters.sort) params.sort = filters.sort;
    params.page = String(page);
    params.limit = String(limit);
    setSearchParams(params);
  }, [filters, page, limit, setSearchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <CategoryFilters value={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">All Products</h1>
              <p className="text-gray-600 text-base md:text-lg">Discover our complete collection across categories</p>
            </div>

            {loading && (
              <div className="text-gray-600">Loading products...</div>
            )}
            {error && (
              <div className="text-red-600">{error}</div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((p) => (
                  <ProductCard
                    key={p._id}
                    id={p._id}
                    title={p.title}
                    image={p.image && p.image[0] ? p.image[0] : undefined}
                    price={p.price}
                    discount={p.discount}
                    reviews={typeof p.rating === 'number' ? Math.round(p.rating * 20) : undefined}
                  />
                ))}
                {items.length === 0 && (
                  <div className="text-gray-600">No products found.</div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {total > 0 ? (
                    <>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</>
                  ) : (
                    <>No results</>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={page * limit >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;

