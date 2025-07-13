
import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Search as SearchIcon, Filter, ShoppingCart, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock: boolean;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'ZIXX Classic Fit T-shirt',
      brand: 'ZIXX',
      category: 'T-Shirts',
      price: 49.99,
      oldPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      inStock: true
    },
    {
      id: '2',
      name: 'Premium Denim Jeans',
      brand: 'Levi\'s',
      category: 'Jeans',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      inStock: true
    },
    {
      id: '3',
      name: 'Casual Button Shirt',
      brand: 'Tommy Hilfiger',
      category: 'Shirts',
      price: 79.99,
      oldPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      inStock: false
    },
    {
      id: '4',
      name: 'Leather Jacket',
      brand: 'Zara',
      category: 'Jackets',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      inStock: true
    },
    {
      id: '5',
      name: 'Summer Dress',
      brand: 'H&M',
      category: 'Dresses',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      inStock: true
    },
    {
      id: '6',
      name: 'Sneakers',
      brand: 'Nike',
      category: 'Shoes',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      inStock: true
    }
  ];

  const categories = ['all', 'T-Shirts', 'Jeans', 'Shirts', 'Jackets', 'Dresses', 'Shoes'];
  const brands = ['all', 'ZIXX', 'Nike', 'Levi\'s', 'Tommy Hilfiger', 'Zara', 'H&M'];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        switch (priceRange) {
          case 'under-50':
            return product.price < 50;
          case '50-100':
            return product.price >= 50 && product.price <= 100;
          case '100-200':
            return product.price >= 100 && product.price <= 200;
          case 'over-200':
            return product.price > 200;
          default:
            return true;
        }
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-base h-12"
              placeholder="Search for products, brands, or categories..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50">Under $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="over-200">Over $200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-shadow">
                <div className="aspect-square relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold">Out of Stock</span>
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {product.brand}
                  </Badge>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-destructive">${product.price}</span>
                    {product.oldPrice && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.oldPrice}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-destructive hover:bg-destructive/90"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
                setPriceRange('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Search;
