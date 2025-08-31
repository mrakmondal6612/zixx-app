import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
import { Heart, ShoppingCart, Star, Plus, Minus, Truck, RotateCcw, Share2, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthContext } from '@/hooks/AuthProvider';
import { apiUrl, getAuthHeaders } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

// Setup axios
axios.defaults.withCredentials = true;

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
  subcategory?: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  gender?: string;
  category?: string;
  theme?: string;
  isWishlisted?: boolean;
  afterQtyprice?: number;
  variation?: {
    size: string;
    color: string;
    quantity: number;
  };
  // backend field for stock quantity
  supply?: number;
}

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { t } = useLanguage();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Image zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: string; y: string }>({ x: '50%', y: '50%' });
  const ZOOM_FACTOR = 1.8;
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);
  const showPrev = () => setCurrentImageIndex((i) => {
    const total = (product?.image?.length || 1);
    return (i - 1 + total) % total;
  });
  const showNext = () => setCurrentImageIndex((i) => {
    const total = (product?.image?.length || 1);
    return (i + 1) % total;
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let url = '';
        if (id) url = apiUrl(`/clients/products/singleproduct/${id}`);
        else {
          const name = new URLSearchParams(location.search).get('name');
          if (name) url = apiUrl(`/clients/products/byname/${encodeURIComponent(name)}`);
        }
        if (!url) return;

        const res = await axios.get(url , { 
          withCredentials: true,
        });

        if (res.data?.ok || res.data?.success) {
          const data = res.data.data;
          const prod = Array.isArray(data) ? data[0] : data;
          if (!prod) {
            toast.error('Product not found');
            return;
          }
          setProduct(prod);
          setSelectedSize(prod.size?.[0] || 'N/A');
          setSelectedColor(prod.color?.[0] || 'N/A');
          setIsWishlisted(prod.isWishlisted || false);
        } else toast.error(res.data?.message || 'Failed to load product');
      } catch (err: any) {
        console.error('Error loading product:', err, 'URL:', (err?.config && err.config.url) || 'n/a');
        // Fallback: if searching by name and it 404s, try to find a close match from all products
        const nameParam = new URLSearchParams(location.search).get('name');
        if (!id && nameParam && err?.response?.status === 404) {
          try {
            const allRes = await axios.get(apiUrl('/clients/products') , { 
              withCredentials: true,
            });
            const list = allRes.data?.data || [];
            const target = nameParam.toLowerCase();
            // simple scoring: prefer startsWith, then includes, then highest overlap count
            let best = null as any;
            let bestScore = -1;
            const tokens = target.split(/\s+/).filter(Boolean);
            for (const p of list) {
              const title = (p.title || '').toLowerCase();
              let score = 0;
              if (title === target) score = 1000;
              else if (title.startsWith(target)) score = 900;
              else if (title.includes(target)) score = 800;
              // token overlap
              score += tokens.reduce((acc, t) => acc + (title.includes(t) ? 1 : 0), 0);
              if (score > bestScore) { bestScore = score; best = p; }
            }
            if (best) {
              setProduct(best);
              setSelectedSize(best.size?.[0] || 'N/A');
              setSelectedColor(best.color?.[0] || 'N/A');
              setIsWishlisted(best.isWishlisted || false);
              toast.message('Showing closest match');
              return;
            }
            toast.error('Product not found');
          } catch (e) {
            toast.error('Failed to fetch product');
          }
        } else {
          if (err?.response?.status === 404) toast.error('Product not found');
          else toast.error('Failed to fetch product');
        }
      }
    };
    fetchProduct();
  }, [id, location.search]);

  // Fetch related products based on current product
  useEffect(() => {
    if (!product) return;
    
    const fetchRelatedProducts = async () => {
      try {
        const res = await axios.get(apiUrl('/clients/products'), {
          withCredentials: true,
        });
        
        if (res.data?.data && Array.isArray(res.data.data)) {
          const allProducts = res.data.data;
          
          // Filter related products based on category, theme, brand, or gender
          const related = allProducts.filter((p: ProductType) => 
            p._id !== product._id && (
              p.category === product.category ||
              p.theme === product.theme ||
              p.brand === product.brand ||
              p.gender === product.gender
            )
          );
          
          // Shuffle and take first 4-8 products
          const shuffled = related.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };

    fetchRelatedProducts();
  }, [product]);
  const ensureLoggedIn = () => {
    if (!user) {
      toast.error('You must be logged in.');
      navigate('/auth');
      return false;
    }
    return true;
  };
  const outOfStock = !!product && (
    typeof (product as any).supply === 'number' ? (product as any).supply <= 0 : product.inStock === false
  );
  const availableStock: number = product && typeof (product as any).supply === 'number'
    ? Math.max(0, (product as any).supply as number)
    : (product?.inStock ? 1 : 0);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    setQuantity((prev) => {
      if (action === 'increase') {
        const next = prev + 1;
        if (availableStock > 0 && next > availableStock) {
          toast.error(`Only ${availableStock} in stock`);
          return prev;
        }
        return next;
      }
      return prev > 1 ? prev - 1 : prev;
    });
  };

  const handleAddToCart = async () => {
    if (!ensureLoggedIn() || !product) return;
    if ((product.size?.length > 0 && !selectedSize) || (product.color?.length > 0 && !selectedColor)) {
      toast.error('Please select required size and color');
      return;
    }

    try {
      const res = await axios.post(apiUrl('/clients/user/addtocart'),
      {
        productId: product._id,
        title: product.title,
        description: product.description || "N/A",  
        brand: product.brand || "N/A",
        color: selectedColor || 'Default Color',
        gender: product.gender || 'Unisex',
        price: product.price,
        discount: product.discount || 0,
        rating: product.rating?.toString() || '0',
        category: product.category || "N/A",
        theme: product.theme || "N/A",
        size: selectedSize || 'Free',
        image: product.image || [],
        Qty: quantity,
        afterQtyprice: (product.price - (product.discount || 0)) * quantity,
        total: (product.price - (product.discount || 0)) * quantity,
        variation: { size: selectedSize, color: selectedColor, quantity },
      },
      {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });

      if (res.data?.ok || res.data?.success) {
        toast.success(`Added ${product.title} to cart!`);
        navigate('/cart');
      } else toast.error(res.data?.message || 'Failed to add to cart');
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/auth');
      else toast.error(err?.response?.data?.message || 'Add to cart failed');
    }
  };

  const handleAddToWishlist = async () => {
    if (!ensureLoggedIn() || !product) return;
    try {
      const res = await axios.post(
        apiUrl('/clients/user/wishlist/add'),
        { productId: product._id },
        { withCredentials: true, headers: { ...getAuthHeaders() } }
      );

      if (res.data?.ok || res.data?.success) {
        toast.success(`Added ${product.title} to wishlist!`);
        setIsWishlisted(true);

        const check = await axios.get(
          apiUrl('/clients/user/wishlist'),
          { withCredentials: true, headers: { ...getAuthHeaders() } }
        );
      } else toast.error(res.data?.message || 'Failed to add to wishlist');
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/auth');
      else toast.error(err?.response?.data?.message || 'Add to wishlist failed');
    }
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <span className="hover:text-foreground">{product.category || 'Category'}</span>
          <span className="mx-2">/</span>
          <span className="hover:text-foreground">{product.subcategory || 'Subcategory'}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{product.title}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10 items-start">
          <div className="flex flex-col gap-3">

            <div
              ref={imageWrapRef}
              className={`rounded-xl bg-white shadow-md border flex items-center justify-center h-[500px] sm:h-[600px] lg:h-[min(85vh,900px)] p-2 md:p-3 overflow-hidden relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={(e) => {
                if (!imageWrapRef.current) return;
                const rect = imageWrapRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin({ x: `${x}%`, y: `${y}%` });
              }}
              onClick={() => setIsZoomed((z) => !z)}
            >
              {/* Open lightbox button */}
              <button
                type="button"
                aria-label="Open fullscreen"
                onClick={(e) => { e.stopPropagation(); openLightbox(); }}
                className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/90 hover:bg-white shadow border"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <img
                src={(product.image && product.image[currentImageIndex])
                  ? product.image[currentImageIndex]
                  : `https://source.unsplash.com/featured/1000x1000/${(product.subcategory || product.category || 'fashion').replace(/\s+/g, '+')}`}
                alt={product.title}
                className={`h-auto w-auto max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 ease-out pointer-events-none select-none`}
                style={{
                  transform: isZoomed ? `scale(${ZOOM_FACTOR})` : 'scale(1)',
                  transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}`,
                }}
              />
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
              {((product.image ?? []).length ? product.image : [
                `https://source.unsplash.com/featured/160x160/${(product.subcategory || product.category || 'fashion').replace(/\s+/g, '+')}`
              ]).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-destructive' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-20 self-start lg:max-h-[calc(100vh-180px)] lg:overflow-auto pr-1">
            <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <Card className="p-3 md:p-4">
              <h3 className="font-semibold mb-2">Product Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 100% Organic Cotton</li>
                <li>• Machine Washable</li>
                <li>• Pre-shrunk Fabric</li>
                <li>• Comfortable Fit</li>
                <li>• Eco-friendly Dyes</li>
              </ul>
            </Card>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-destructive">₹{product.price}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg md:text-xl text-muted-foreground line-through">₹{(product.price/(1 - product.discount/100)).toFixed(2)}</span>
                  <Badge variant="destructive">{Math.round(product.discount)}% OFF</Badge>
                </>
              )}
              {outOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : (
                <Badge variant="secondary">In Stock</Badge>
              )}
            </div>
            {!outOfStock && (
              <p className="text-sm text-muted-foreground -mt-2">{availableStock} item{availableStock === 1 ? '' : 's'} left</p>
            )}

            {/* Size Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              {product.size?.length ? (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select a size" /></SelectTrigger>
                  <SelectContent>
                    {product.size.map((size) => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : <p className="text-sm text-gray-500">No size options available</p>}
            </div>

            {/* Color Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              {product.color?.length ? (
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select a color" /></SelectTrigger>
                  <SelectContent>
                    {product.color.map((color) => (<SelectItem key={color} value={color}>{color}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : <p className="text-sm text-gray-500">No color options available</p>}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1 || outOfStock}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange('increase')} disabled={outOfStock || (availableStock > 0 && quantity >= availableStock)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 md:gap-4">
              <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleAddToCart} disabled={outOfStock || (availableStock > 0 && quantity > availableStock)}>
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
              <Button variant="outline" size="icon" onClick={handleAddToWishlist} className={isWishlisted ? 'text-destructive border-destructive' : ''}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigator?.share?.({ title: product.title, url: window.location.href }).catch(() => {})}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-3 md:p-4 flex items-center gap-3">
                <Truck className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">3-5 business days</p>
                </div>
              </Card>
              <Card className="p-3 md:p-4 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">Within 14 days</p>
                </div>
              </Card>
            </div>

            {/* Description */}
            <Card className="p-3 md:p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <details open className="text-sm text-muted-foreground leading-relaxed">
                <summary className="cursor-pointer text-foreground mb-2">Read more</summary>
                <p>{product.description || 'No description available for this product.'}</p>
              </details>
            </Card>
          </div>
        </div>

        <div className="border-t pt-16">
          <ReviewSection productId={product._id} />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div key={relatedProduct._id || index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-lg transition-shadow">
                  <Link to={`/product/${relatedProduct._id}`} className="block">
                    <div className="aspect-square bg-gray-100 mb-3 sm:mb-4 rounded-lg overflow-hidden">
                      <img
                        src={Array.isArray(relatedProduct.image) ? relatedProduct.image[0] : relatedProduct.image || `https://source.unsplash.com/featured/400x400/${(relatedProduct.category || 'fashion').replace(/\s+/g, '+')}`}
                        alt={relatedProduct.title}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2">{relatedProduct.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">₹{relatedProduct.price}</span>
                      {relatedProduct.oldPrice && (
                        <>
                          <span className="text-gray-500 line-through text-sm">₹{relatedProduct.oldPrice}</span>
                          <span className="text-[#D92030] text-sm font-medium">
                            {Math.round((1 - relatedProduct.price / relatedProduct.oldPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    {relatedProduct.brand && (
                      <p className="text-xs text-gray-500 mt-1">{relatedProduct.brand}</p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <ScrollToTop />

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            <X className="w-7 h-7" />
          </button>

          {(product.image?.length || 0) > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                className="absolute left-4 md:left-6 text-white/90 hover:text-white"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
              >
                <ChevronLeft className="w-9 h-9" />
              </button>
              <button
                type="button"
                aria-label="Next"
                className="absolute right-4 md:right-6 text-white/90 hover:text-white"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
              >
                <ChevronRight className="w-9 h-9" />
              </button>
            </>
          )}

          <img
            src={(product.image && product.image[currentImageIndex])
              ? product.image[currentImageIndex]
              : `https://source.unsplash.com/featured/1400x1400/${(product.subcategory || product.category || 'fashion').replace(/\s+/g, '+')}`}
            alt={product.title}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Product;
