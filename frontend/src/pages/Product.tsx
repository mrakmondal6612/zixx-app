import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ReviewSection } from '@/components/ReviewSection';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ProductType {
  _id: string;
  title: string;
  description?: string;
  brand?: string;
  price: number;
  discount: number;
  oldPrice?: number;
  image?: string[];
  size?: string[];
  color?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  gender?: string;
  category?: string;
  theme?: string;
  isWishlisted?: boolean;
  afterQtyprice?: number;
  vriation?: {
    size: string;
    color: string;
    quantity: number;
  };
}

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleShowReviews = () => setShowAll((prev) => !prev);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let apiUrl = '';
        let byName = false;
        if (id) {
          apiUrl = `/clients/products/singleproduct/${id}`;
        } else {
          // Try to get name from query string
          const params = new URLSearchParams(location.search);
          const name = params.get('name');
          if (name) {
            apiUrl = `/clients/products/byname/${encodeURIComponent(name)}`;
            byName = true;
          }
        }
        if (!apiUrl) return;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Failed to fetch product');
        const result = await res.json();
        if (result.ok) {
          setProduct(result.data);
          setSelectedSize(result.data.size?.[0] || '');
          setSelectedColor(result.data.color?.[0] || '');
          setIsWishlisted(result.data.isWishlisted || false);
          setReviews(result.data.reviews || []);
        } else {
          toast.error(result.message || 'Failed to load product');
          setProduct(null);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      }
    };
    fetchProduct();
  }, [id, location.search]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    setQuantity((prev) =>
      action === 'increase' ? prev + 1 : prev > 1 ? prev - 1 : prev
    );
  };

  const handleAddToCart = async () => {
    if (
      !product ||
      (product.size?.length > 0 && !selectedSize) ||
      (product.color?.length > 0 && !selectedColor)
    ) {
      toast.error('Please select required size and color');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to add to cart.');
        navigate('/login');
        return;
      }
      const res = await axios.post(
        '/clients/user/addtocart',
        {
          userId: undefined, // will be set by backend
          productId: product._id,
          title: product.title,
          description: product.description || '',
          brand: product.brand || '',
          color: selectedColor || 'Default Color',
          gender: product.gender || 'Unisex',
          price: product.price,
          discount: product.discount || 0,
          rating: product.rating?.toString() || '0',
          category: product.category || '',
          theme: product.theme || '',
          size: selectedSize || 'Free',
          image: product.image || [],
          Qty: quantity,
          afterQtyprice: (product.price - (product.discount || 0)) * quantity,
          total: (product.price - (product.discount || 0)) * quantity,
          variation: {
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
          },
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success(`Added ${product.title} to cart!`);
        setTimeout(() => {
          navigate('/cart');
        }, 500);
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      if (err?.response?.status === 401) {
        toast.error('You must be logged in to add to cart.');
        navigate('/login');
      } else {
        toast.error('Add to cart failed (Are you logged in?)');
      }
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to add to wishlist.');
        navigate('/login');
        return;
      }
      const res = await axios.post(
        '/clients/user/wishlist/add',
        { productId: product._id },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast.success(`Added ${product.title} to wishlist!`);
        setIsWishlisted(true);
      } else {
        toast.error('Failed to add to wishlist');
      }
    } catch (err) {
      console.error('Add to wishlist error:', err);
      if (err?.response?.status === 401) {
        toast.error('You must be logged in to add to wishlist.');
        navigate('/login');
      } else {
        toast.error('Add to wishlist failed (Are you logged in?)');
      }
    }
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {product.image?.[currentImageIndex] && (
                <img
                  src={product.image[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {(product.image ?? []).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index
                      ? 'border-destructive'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.brand}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  {product.description || 'No description available.'}
                </div>
                
                {/* <Button variant="link" className="p-0 font-normal" onClick={handleShowReviews}>
                  {showAll ? 'Show less' : 'Show more'}
                </Button> */}
              </div>
            </div>
            {/* Features Section */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Product Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 100% Organic Cotton</li>
                <li>• Machine Washable</li>
                <li>• Pre-shrunk Fabric</li>
                <li>• Comfortable Fit</li>
                <li>• Eco-friendly Dyes</li>
              </ul>
            </Card>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-destructive">
                ₹{product.price}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    $
                    {(
                      product.price /
                      (1 - product.discount / 100)
                    ).toFixed(2)}
                  </span>
                  <Badge variant="destructive">
                    {Math.round(product.discount)}% OFF
                  </Badge>
                </>
              )}
            </div>

          

            {/* Size Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label> 
              {product.size?.length ? (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.size.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">
                  No size options available
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              {product.color?.length ? (
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.color.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">
                  No color options available
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium text-lg w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cart + Wishlist Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/90"
                disabled={
                  (product.size?.length > 0 && !selectedSize) ||
                  (product.color?.length > 0 && !selectedColor)
                }
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddToWishlist}
                className={
                  isWishlisted ? 'text-destructive border-destructive' : ''
                }
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                />
              </Button>
            </div>

            
          </div>
        </div>

        {/* Review Section */}
        <div className="border-t pt-16">
          <ReviewSection productId={product._id} />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Product;
