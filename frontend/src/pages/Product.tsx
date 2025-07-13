import React, { useState } from 'react';
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

const Product = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product database
  const products = {
    '1': {
      id: '1',
      name: 'ZIXX Premium Cotton T-Shirt',
      brand: 'ZIXX',
      price: 49.99,
      oldPrice: 69.99,
      description: 'Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this shirt offers exceptional softness and durability. Perfect for casual wear or layering.',
      images: [
        '/lovable-uploads/66969790-cb99-46f5-a0c8-2c9520436139.png',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy', 'Gray', 'Red'],
      inStock: true,
      rating: 4.5,
      reviewCount: 128
    },
    '2': {
      id: '2',
      name: 'Vertical Striped Shirt',
      brand: 'ZIXX',
      price: 29.99,
      oldPrice: 44.99,
      description: 'Classic vertical striped shirt with modern fit. Perfect for both casual and semi-formal occasions.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3eb5973361b70df8423fb8187c106fa1cccf9ee?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Blue', 'White', 'Navy'],
      inStock: true,
      rating: 4.2,
      reviewCount: 95
    },
    '3': {
      id: '3',
      name: 'Orange Graphic T-shirt',
      brand: 'ZIXX',
      price: 19.99,
      oldPrice: 24.99,
      description: 'Vibrant orange graphic t-shirt with unique design. Perfect for adding color to your wardrobe.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/1ae9ee2293ad29eef209760dacb27c2cfcc587ac?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Orange', 'Black', 'White'],
      inStock: true,
      rating: 4.1,
      reviewCount: 67
    },
    '4': {
      id: '4',
      name: 'Loose Fit Bermuda Shorts',
      brand: 'ZIXX',
      price: 34.99,
      oldPrice: 44.99,
      description: 'Comfortable loose fit bermuda shorts. Perfect for summer and casual occasions.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/195176e2222a7c41d44bd7662e7402d74c61a9a0?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Khaki', 'Navy', 'Black', 'Olive'],
      inStock: true,
      rating: 4.3,
      reviewCount: 112
    },
    '5': {
      id: '5',
      name: 'Faded Skinny Jeans',
      brand: 'ZIXX',
      price: 49.99,
      oldPrice: 64.99,
      description: 'Premium faded skinny jeans with modern cut. Comfortable and stylish for everyday wear.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/323635352eed4542ef83c5e9d41e0f884d43499e?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600'
      ],
      sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Light Blue', 'Dark Blue', 'Black'],
      inStock: true,
      rating: 4.6,
      reviewCount: 187
    },
    '6': {
      id: '6',
      name: 'Oversized Black Tee',
      brand: 'ZIXX',
      price: 39.99,
      oldPrice: 49.99,
      description: 'Comfortable oversized black t-shirt. Perfect for streetwear and casual looks.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/f3a59d3c18ef931719e92290738cf5332a8d0bb8?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Gray'],
      inStock: true,
      rating: 4.4,
      reviewCount: 143
    },
    '7': {
      id: '7',
      name: 'Gray Classic Fit T-shirt',
      brand: 'ZIXX',
      price: 24.99,
      oldPrice: 34.99,
      description: 'Classic gray t-shirt with comfortable fit. A wardrobe essential for any occasion.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/a3778de0b6fa7c76cfd3fcebbe3550413b4e6770?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Gray', 'Black', 'White', 'Navy'],
      inStock: true,
      rating: 4.2,
      reviewCount: 89
    },
    '8': {
      id: '8',
      name: 'Urban Streetwear Tee',
      brand: 'ZIXX',
      price: 32.99,
      oldPrice: 42.99,
      description: 'Urban style streetwear t-shirt with unique design. Perfect for making a statement.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/eb643d7fe0ae4338ccb6e5788c39e2bcd9311740?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Red'],
      inStock: true,
      rating: 4.5,
      reviewCount: 76
    },
    'new-1': {
      id: 'new-1',
      name: 'Looney Tunes: Super Genius',
      brand: 'ZIXX',
      price: 1299,
      oldPrice: 1499,
      description: 'Comfortable oversized t-shirt featuring your favorite Looney Tunes character. Perfect for casual wear and everyday comfort.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/639ea10294150931c436ba9a4b2f0e7af3d89ef1?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Gray'],
      inStock: true,
      rating: 4.3,
      reviewCount: 89
    },
    'new-2': {
      id: 'new-2',
      name: 'Solids: Pristin',
      brand: 'ZIXX',
      price: 1699,
      oldPrice: 1999,
      description: 'Comfortable joggers perfect for lounging or light workouts. Made with premium cotton blend for ultimate comfort.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/742a7fa671fcc9bd7fc20b29aca893d6c6b08df0?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Gray', 'Charcoal'],
      inStock: true,
      rating: 4.6,
      reviewCount: 156
    },
    'new-3': {
      id: 'new-3',
      name: 'Jurassic World: Dino Park',
      brand: 'ZIXX',
      price: 1049,
      oldPrice: 1299,
      description: 'Show your love for dinosaurs with this comfortable oversized t-shirt featuring Jurassic World design.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/1333128ba1905776d285bd7cf9593004cfeda25f?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Green'],
      inStock: true,
      rating: 4.4,
      reviewCount: 203
    },
    'new-4': {
      id: 'new-4',
      name: 'Batman: Wayne Industries',
      brand: 'ZIXX',
      price: 1499,
      oldPrice: 1799,
      description: 'Premium oversized shirt featuring Batman Wayne Industries design. Perfect for superhero fans.',
      images: [
        'https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/900b60ad07e2ffb6286d5bdfcf42caeb7a8548a1?placeholderIfAbsent=true',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f37f8036?w=600'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'Gray'],
      inStock: true,
      rating: 4.7,
      reviewCount: 134
    }
  };

  // Get product by ID or default to first product
  const product = products[id as keyof typeof products] || products['1'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    // Get existing cart items from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Create new cart item
    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      brand: product.brand
    };

    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.productId === product.id && 
                    item.size === selectedSize && 
                    item.color === selectedColor
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(existingCart));
    
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-destructive' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
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
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-destructive">${product.price}</span>
              {product.oldPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">${product.oldPrice}</span>
                  <Badge variant="destructive">
                    {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
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
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-destructive hover:bg-destructive/90"
                disabled={!selectedSize || !selectedColor}
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

            {/* Product Features */}
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

        {/* Reviews Section */}
        <div className="border-t pt-16">
          <ReviewSection productId={product.id} />
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Product;