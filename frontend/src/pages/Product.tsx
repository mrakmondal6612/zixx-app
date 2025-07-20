import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ReviewSection } from '@/components/ReviewSection';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductType {
  _id: string;
  title: string;
  brand: string;
  price: number;
  discount: number;
  oldPrice?: number;
  description: string;
  image?: string[];
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/singleproduct/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const result = await res.json();
        if (result.ok) setProduct(result.data);
      } catch (err) {
        console.error('Error loading product:', err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
      toast.error('Please select required size and color');
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const cartItem = {
      id: `${product._id}-${selectedSize}-${selectedColor}`,
      productId: product._id,
      name: product.title,
      price: product.price,
      image: product.image?.[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      brand: product.brand
    };

    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.productId === product._id && item.size === selectedSize && item.color === selectedColor
    );

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cartItems', JSON.stringify(existingCart));
    toast.success(`Added ${product.title} to cart!`);
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
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
                    currentImageIndex === index ? 'border-destructive' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-destructive">${product.price}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <Badge variant="destructive">
                    {Math.round(product.discount)}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              {product.sizes?.length ? (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No size options available</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              {product.colors?.length ? (
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No color options available</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange('increase')}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/90"
                disabled={
                  (product.sizes?.length > 0 && !selectedSize) ||
                  (product.colors?.length > 0 && !selectedColor)
                }
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? 'text-destructive border-destructive' : ''}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

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
          </div>
        </div>

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
