import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Plus, Package, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  image: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    image: '',
    sizes: '',
    colors: '',
    inStock: true
  });

  const categories = [
    'T-Shirts', 'Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Shoes', 'Bags'
  ];

  const brands = [
    'ZIXX', 'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Tommy Hilfiger'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      brand: newProduct.brand,
      description: newProduct.description,
      image: newProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      sizes: newProduct.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: newProduct.colors.split(',').map(c => c.trim()).filter(c => c),
      inStock: newProduct.inStock
    };

    setProducts([...products, product]);
    setNewProduct({
      name: '',
      price: '',
      category: '',
      brand: '',
      description: '',
      image: '',
      sizes: '',
      colors: '',
      inStock: true
    });

    toast.success('Product added successfully!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct({...newProduct, image: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=32&h=32&fit=crop&crop=center" 
              alt="Admin" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Product
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-price">Price *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Brand</Label>
                <Select value={newProduct.brand} onValueChange={(value) => setNewProduct({...newProduct, brand: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="product-image">Product Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="product-image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="Image URL or upload file"
                  />
                  <div className="relative">
                    <Button type="button" variant="outline" className="shrink-0">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="product-sizes"
                    value={newProduct.sizes}
                    onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <Label htmlFor="product-colors">Colors (comma-separated)</Label>
                  <Input
                    id="product-colors"
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({...newProduct, colors: e.target.value})}
                    placeholder="Red, Blue, Black"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90">
                <Save className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </form>
          </Card>

          {/* Products List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No products added yet. Add your first product!
                </p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 border border-border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.brand} • {product.category}</p>
                      <p className="font-bold text-destructive">${product.price}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Admin;