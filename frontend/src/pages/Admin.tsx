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
import { Plus, Save, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { user, role, loading } = useAuthContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      // ignore
    }
  };
  // Track edit mode
  const [editId, setEditId] = useState(null);
  // Edit product: populate form with product data (map backend fields to form fields)
  const handleEditProduct = (prod) => {
    // Robustly handle color/colours/colors/colour and fallback to string
    let colorValue = '';
    if (Array.isArray(prod.colors) && prod.colors.length > 0) colorValue = prod.colors.join(', ');
    else if (Array.isArray(prod.color) && prod.color.length > 0) colorValue = prod.color.join(', ');
    else if (Array.isArray(prod.colours) && prod.colours.length > 0) colorValue = prod.colours.join(', ');
    else if (Array.isArray(prod.colour) && prod.colour.length > 0) colorValue = prod.colour.join(', ');
    else if (typeof prod.colors === 'string') colorValue = prod.colors;
    else if (typeof prod.color === 'string') colorValue = prod.color;
    else if (typeof prod.colours === 'string') colorValue = prod.colours;
    else if (typeof prod.colour === 'string') colorValue = prod.colour;

    setNewProduct({
      title: prod.title || '',
      description: prod.description || '',
      brand: prod.brand || '',
      gender: prod.gender || '',
      category: prod.category || '',
      subcategory: prod.subcategory || '',
      price: prod.price?.toString() || '',
      discount: prod.discount?.toString() || '',
      rating: prod.rating?.toString() || '',
      theme: prod.theme || '',
      size: Array.isArray(prod.size) ? prod.size.join(', ') : '',
      color: colorValue,
      images: Array.isArray(prod.image) ? prod.image : [], // backend: image, form: images
    });
    setEditId(prod._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Product loaded for editing. Make changes and submit to update.');
  };

  // Delete product (PATCH route for delete)
  const handleDeleteProduct = async (prodId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You're not logged in as admin");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/delete/${prodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (res.ok && data && data.ok) {
        toast.success('Product deleted!');
        setProducts((prev) => prev.filter(p => p._id !== prodId));
      } else {
        toast.error((data && data.msg) || 'Failed to delete');
      }
    } catch (err) {
      toast.error(err?.message || 'Error deleting product');
    }
  };
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    brand: '',
    gender: '',
    category: '',
    subcategory: '',
    price: '',
    discount: '',
    rating: '',
    theme: '',
    size: '', // comma separated string for form, array for backend
    color: '', // comma separated string for form, array for backend
    images: [], // array of image URLs for form, sent as 'image' to backend
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
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You're not logged in as admin");
      return;
    }

    // List of required fields
    const requiredFields = [
      { key: 'title', label: 'Title' },
      { key: 'brand', label: 'Brand' },
      { key: 'gender', label: 'Gender' },
      { key: 'category', label: 'Category' },
      { key: 'subcategory', label: 'Subcategory' },
      { key: 'price', label: 'Price' },
      { key: 'description', label: 'Description' },
      { key: 'theme', label: 'Theme' },
    ];
    const missing = requiredFields.filter(f => !newProduct[f.key] || newProduct[f.key].toString().trim() === '');
    if (missing.length > 0) {
      toast.error('Please fill: ' + missing.map(f => f.label).join(', '));
      return;
    }

    // Map form fields to backend model: send both 'color' and 'colors' arrays for compatibility
    const colorArr = newProduct.color ? newProduct.color.split(',').map(c => c.trim()).filter(Boolean) : [];
    const productToSubmit = {
      title: newProduct.title,
      description: newProduct.description,
      brand: newProduct.brand,
      gender: newProduct.gender,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      price: newProduct.price ? parseFloat(newProduct.price) : 0,
      discount: newProduct.discount ? parseFloat(newProduct.discount) : 0,
      rating: newProduct.rating ? parseFloat(newProduct.rating) : 0,
      theme: newProduct.theme,
      size: newProduct.size ? newProduct.size.split(',').map(s => s.trim()).filter(Boolean) : [],
      color: colorArr,
      colors: colorArr,
      images: Array.isArray(newProduct.images) && newProduct.images.length > 0
        ? newProduct.images.filter(img => !!img)
        : ['https://via.placeholder.com/300x300?text=No+Image'],
    };
    console.log('Submitting product:', productToSubmit);

    try {
      let res, data;
      if (editId) {
        // Update existing product (PATCH, correct route)
        res = await fetch(`/api/products/update/${editId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productToSubmit)
        });
        let data = null;
        try { data = await res.json(); } catch {}
        if (res.ok && data && data.ok) {
          toast.success('Product updated successfully!');
          setProducts((prev) => prev.map(p => p._id === editId ? data.data : p));
        } else {
          toast.error((data && data.msg) || 'Failed to update product');
          return;
        }
      } else {
        // Add new product
        res = await fetch('/api/products/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productToSubmit)
        });
        data = await res.json();
        if (res.ok && data.ok) {
          toast.success('Product added successfully!');
          setProducts((prev) => [data.data, ...prev]);
        } else {
          toast.error(data.msg || 'Failed to add product');
          return;
        }
      }
      setNewProduct({
        title: '', description: '', brand: '', gender: '', category: '', subcategory: '', price: '',
        discount: '', rating: '', theme: '', size: '', color: '', images: []
      });
      setEditId(null);
    } catch (err) {
      toast.error('Error submitting product');
      console.error('Fetch error:', err);
    }
  };

  // Cloudinary unsigned upload preset and cloud name (replace with your values)
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []) as File[];
  if (!files.length) return;

  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
    toast.error("Missing Cloudinary config in .env");
    return;
  }

  setImageUploading(true);
  try {
    const uploaders = files.map(async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();

        if (data.secure_url) {
          return data.secure_url;
        } else {
          toast.error("Upload failed: " + (data.error?.message || "Unknown error"));
          return null;
        }
      } catch (err: any) {
        toast.error("Upload error: " + err.message);
        return null;
      }
    });

    const urls = (await Promise.all(uploaders)).filter(Boolean) as string[];

    if (urls.length > 0) {
      setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success("Images uploaded!");
    }
  } finally {
    setImageUploading(false);
  }
};

// Remove an image from the images array
const handleRemoveImage = (idx: number) => {
  setNewProduct((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
};


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <img
              src={user?.profile_pic || "/placeholder.svg"}
              alt="Admin"
              className="w-8 h-8 rounded-lg object-cover border border-gray-300 bg-white"
            />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Gen-Z Form */}
          <Card className="p-8 bg-gradient-to-br from-fuchsia-100 via-cyan-100 to-white rounded-3xl shadow-2xl border-2 border-fuchsia-200">
            <h2 className="text-4xl md:text-5xl font-black mb-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-400 animate-gradient-x drop-shadow-2xl uppercase tracking-widest">
              <span className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 shadow-2xl border-4 border-white/60 animate-bounce-slow">
                <Plus className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </span>
              <span className="text-center md:text-left">Add New Product</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols- lg:grid-cols-2 gap-8 md:gap-12">
                <div className="flex flex-col gap-4 border-fuchsia-200 hover:shadow-fuchsia-300 transition-shadow duration-300">
                  <Label className="text-base font-bold text-fuchsia-600">Title *</Label>
                  <Input required placeholder="Product Title" className="rounded-2xl border-2 border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} />
                  <Label className="text-base font-bold text-fuchsia-600">Brand *</Label>
                  <Input required placeholder="Brand Name" className="rounded-2xl border-2 border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
                  <Label className="text-base font-bold text-fuchsia-600">Gender *</Label>
                  <Select value={newProduct.gender} onValueChange={value => setNewProduct({ ...newProduct, gender: value })}>
                    <SelectTrigger className="rounded-2xl border-2 border-fuchsia-400 bg-white/80 font-bold text-fuchsia-700 shadow-lg hover:scale-[1.03] transition-all duration-200">
                  <SelectValue placeholder="Select gender *" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label className="text-base font-bold text-fuchsia-600">Category *</Label>
                  <Select value={newProduct.category} onValueChange={value => setNewProduct({ ...newProduct, category: value })}>
                    <SelectTrigger className="rounded-2xl border-2 border-fuchsia-400 bg-white/80 font-bold text-fuchsia-700 shadow-lg hover:scale-[1.03] transition-all duration-200">
                  <SelectValue placeholder="Select category *" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label className="text-base font-bold text-fuchsia-600">Subcategory *</Label>
                  <Input required placeholder="Subcategory" className="rounded-2xl border-2 border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.subcategory} onChange={e => setNewProduct({ ...newProduct, subcategory: e.target.value })} />
                  {/* Colors and Product Images side by side */}
                
                  <Label className="text-base font-bold text-fuchsia-600">Description *</Label>
                  <textarea required placeholder="Product Description" className="rounded-2xl border-2 border-cyan-400 focus:ring-4 focus:ring-cyan-300 w-4xl min-h-[6px] p-4 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label className="text-base font-bold text-fuchsia-600">Price *</Label>
                  <Input required type="number" placeholder="₹ Price" className="rounded-2xl border-2 border-cyan-400 focus:ring-4 focus:ring-cyan-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                      
                  <Label className="text-base font-bold text-fuchsia-600">Discount (%)</Label>
                  <Input type="number" placeholder="Discount %" className="rounded-2xl border-2 border-cyan-400 focus:ring-4 focus:ring-cyan-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} />
                  <Label className="text-base font-bold text-fuchsia-600">Rating</Label>
                  <Input type="text" placeholder="Rating (optional)" className="rounded-2xl border-2 border-cyan-400 focus:ring-4 focus:ring-cyan-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.rating} onChange={e => setNewProduct({ ...newProduct, rating: e.target.value })} />
                  <Label className="text-base font-bold text-fuchsia-600">Sizes (comma separated)</Label>
                  <Input placeholder="e.g. S, M, L, XL" className="rounded-2xl border-2 border-cyan-400 focus:ring-4 focus:ring-cyan-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-lg hover:scale-[1.03] transition-all duration-200" value={newProduct.size} onChange={e => setNewProduct({ ...newProduct, size: e.target.value })} />
                  <Label className="text-base font-bold text-fuchsia-600">Colors (comma separated)</Label>
                  <Input placeholder="e.g. Red, Blue, Green" className="rounded-2xl border-2 border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-300 bg-white/80 font-bold text-cyan-700 placeholder:text-cyan-300 shadow-md hover:scale-[1.03] transition-all duration-200" value={newProduct.color} onChange={e => setNewProduct({ ...newProduct, color: e.target.value })} />
                   <Label className="text-base font-bold text-fuchsia-600">Theme</Label>
                  <Select value={newProduct.theme} onValueChange={value => setNewProduct({ ...newProduct, theme: value })}>
                    <SelectTrigger className="rounded-2xl border-2 border-cyan-400 bg-white/80 font-bold text-fuchsia-600 shadow-lg hover:scale-[1.03] transition-all duration-200">
                  <SelectValue placeholder="Select theme *" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                      <Label className="text-base font-bold text-fuchsia-600">Product Images</Label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="mt-2 block w-full text-sm text-fuchsia-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100"
                        disabled={imageUploading}
                      />
                      {imageUploading && (
                        <div className="flex items-center gap-2 mt-2 text-fuchsia-600 font-bold animate-pulse">
                          <svg className="animate-spin h-5 w-5 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          Uploading images...
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                        {Array.isArray(newProduct.images) && newProduct.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`preview-${idx}`} className="w-35 h-16 md:w-35 md:h-20 object-cover rounded-2xl border-2 border-fuchsia-400 shadow-md hover:scale-110 transition-transform duration-200" />
                            <button type="button" onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-fuchsia-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10 text-xs hidden group-hover:block"
                              title="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-600 hover:to-cyan-500 text-white font-extrabold py-3 rounded-2xl shadow-lg transition-all duration-200 text-lg tracking-wider">
                <Save className="w-5 h-5 mr-2" /> {editId ? 'Update Product' : 'Add Product'}
              </Button>
              {editId && (
                <Button type="button" onClick={() => { setEditId(null); setNewProduct({ title: '', description: '', brand: '', gender: '', category: '', subcategory: '', price: '', discount: '', rating: '', theme: '', size: '', color: '', images: [] }); }}
                  className="w-full mt-2 bg-gradient-to-r from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 text-gray-700 font-bold py-2 rounded-2xl shadow transition-all duration-200 text-base">
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
          {/* Product List */}
          <div className="flex flex-col gap-6 h-full bg-gradient-to-tr from-fuchsia-200/80 via-cyan-100/80 to-white/60 backdrop-blur-md backdrop-saturate-150 border-2 border-fuchsia-300 shadow-2xl rounded-[2.5rem] p-2">
            <h3 className="text-2xl font-extrabold mb-4 text-center tracking-widest uppercase">
              <span className="inline-block px-6 py-2 rounded-2xl bg-white text-fuchsia-700 border-2 border-fuchsia-400 shadow-lg">
                Uploaded Products
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-4 max-h-[900px] min-h-[700px] overflow-y-auto pr-2">
              {products.length === 0 && (
                <div className="text-center text-fuchsia-400 font-semibold">No products yet.</div>
              )}
              {products.map((prod) => (
                <div key={prod._id} className="flex items-center gap-4 bg-white/80 rounded-2xl border border-cyan-200 shadow-md p-3 hover:shadow-xl transition-all">
                  <img src={prod.image?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'} alt={prod.title} className="w-16 h-16 object-cover rounded-xl border-2 border-fuchsia-300" />
                  <div className="flex-1">
                    <div className="font-bold text-fuchsia-700 text-lg">{prod.title}</div>
                    <div className="text-cyan-700 text-sm">{prod.brand} | {prod.category}</div>
                    <div className="text-xs text-gray-500">₹{prod.price} | {prod.gender} | {prod.theme}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-xl bg-cyan-100 text-cyan-700 font-bold hover:bg-cyan-200 transition-all text-xs shadow flex items-center" title="Edit" onClick={() => handleEditProduct(prod)}>
                      <Pencil className="h-4 w-4 inline" />
                    </button>
                    <button className="px-3 py-1 rounded-xl bg-fuchsia-100 text-fuchsia-700 font-bold hover:bg-fuchsia-200 transition-all text-xs shadow flex items-center" title="Delete" onClick={() => handleDeleteProduct(prod._id)}>
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Admin;
