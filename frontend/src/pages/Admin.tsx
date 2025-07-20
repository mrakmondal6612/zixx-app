import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/hooks/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { role, loading } = useAuthContext();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '', gender: '', category: '', subcategory: '', price: '',
    discount: '', rating: '', theme: '', sizes: '', colors: '', image: ''
  });

  const categories = ['T-Shirts', 'Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Shoes', 'Bags'];
  const genders = ['Men', 'Women', 'Kids'];
  const themes = ['Best Sellers', 'New Arrivals', 'Limited Edition'];

  useEffect(() => {
    if (!loading && role !== 'admin') {
      toast.error('Unauthorized');
      navigate('/');
    }
  }, [role, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productToSubmit = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      discount: parseFloat(newProduct.discount),
      sizes: newProduct.sizes.split(',').map(s => s.trim()),
      colors: newProduct.colors.split(',').map(c => c.trim()),
      image: [newProduct.image],
      userId: user?._id
    };

    try {
      const res = await fetch('/api/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productToSubmit)
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Product added successfully!');
        setNewProduct({
          title: '', gender: '', category: '', subcategory: '', price: '',
          discount: '', rating: '', theme: '', sizes: '', colors: '', image: ''
        });
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch {
      toast.error('Error submitting product');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setNewProduct({ ...newProduct, image: result });
        }
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
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={newProduct.gender} onValueChange={(value) => setNewProduct({ ...newProduct, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Input value={newProduct.subcategory} onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })} />
              </div>
              <div>
                <Label>Theme</Label>
                <Select value={newProduct.theme} onValueChange={(value) => setNewProduct({ ...newProduct, theme: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Rating</Label>
                <Input value={newProduct.rating} onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })} />
              </div>
              <div>
                <Label>Sizes (comma separated)</Label>
                <Input value={newProduct.sizes} onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })} />
              </div>
              <div>
                <Label>Colors (comma separated)</Label>
                <Input value={newProduct.colors} onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
              </div>
              <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90">
                <Save className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Admin;
