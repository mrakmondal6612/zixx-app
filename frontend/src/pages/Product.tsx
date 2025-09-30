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
  basePrice?: number; // Original product price
  price: number; // Final calculated price
  tax?: {
    type: 'free' | 'percentage';
    value: number;
  };
  shippingCost?: {
    type: 'free' | 'fixed';
    value: number;
  };
  discount?: {
    type: 'percentage' | 'fixed' | 'coupon';
    value: number;
  } | number; // Can be object (new schema) or number (legacy)
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
  features?: string[];
  variation?: {
    size: string;
    color: string;
    quantity: number;
  };
  // backend field for stock quantity
  supply?: number;
}

// Helper function to render formatted text
const formatDescription = (text: string) => {
  if (!text) return null;
  
  return text.split('\n').map((line, index) => {
    // Replace **text** with bold
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *text* with italic
    formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace • or - at start with bullet point
    formattedLine = formattedLine.replace(/^[•\-]\s*/, '• ');
    
    return (
      <span key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="block" />
    );
  });
};

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullFeatures, setShowFullFeatures] = useState(false);
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

  // Check if product is in wishlist
  useEffect(() => {
    if (!product || !user) return;
    
    const checkWishlistStatus = async () => {
      try {
        const res = await axios.get(
          apiUrl('/clients/user/wishlist'),
          { withCredentials: true, headers: { ...getAuthHeaders() } }
        );
        
        if (res.data?.data && Array.isArray(res.data.data)) {
          const isInWishlist = res.data.data.some((item: any) => item._id === product._id);
          setIsWishlisted(isInWishlist);
        }
      } catch (err) {
        console.error('Error checking wishlist status:', err);
      }
    };
    
    checkWishlistStatus();
  }, [product?._id, user]);

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
        price: product.price, // Final calculated price
        basePrice: product.basePrice || product.price,
        tax: product.tax,
        shippingCost: product.shippingCost,
        discount: product.discount,
        rating: product.rating?.toString() || '0',
        category: product.category || "N/A",
        theme: product.theme || "N/A",
        size: selectedSize || 'Free',
        image: product.image || [],
        Qty: quantity,
        afterQtyprice: product.price * quantity, // Price is already final
        total: product.price * quantity,
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
      if (isWishlisted) {
        // Remove from wishlist
        const res = await axios.post(
          apiUrl('/clients/user/wishlist/remove'),
          { productId: product._id },
          { withCredentials: true, headers: { ...getAuthHeaders() } }
        );

        if (res.data?.ok || res.data?.success) {
          toast.success(`Removed ${product.title} from wishlist!`);
          setIsWishlisted(false);
        } else toast.error(res.data?.message || 'Failed to remove from wishlist');
      } else {
        // Add to wishlist
        const res = await axios.post(
          apiUrl('/clients/user/wishlist/add'),
          { productId: product._id },
          { withCredentials: true, headers: { ...getAuthHeaders() } }
        );

        if (res.data?.ok || res.data?.success) {
          toast.success(`Added ${product.title} to wishlist!`);
          setIsWishlisted(true);
        } else toast.error(res.data?.message || 'Failed to add to wishlist');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/auth');
      else toast.error(err?.response?.data?.message || 'Wishlist operation failed');
    }
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-purple-500 transition-colors">Home</Link>
          <span className="text-purple-300">→</span>
          <Link to={`/category/${product.category}`} className="hover:text-purple-500 transition-colors">{product.category || 'Category'}</Link>
          <span className="text-purple-300">→</span>
          <Link to={`/category/${product.category}/${product.subcategory}`} className="hover:text-purple-500 transition-colors">{product.subcategory || 'Subcategory'}</Link>
          <span className="text-purple-300">→</span>
          <span className="text-purple-600 font-medium truncate">{product.title}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10 items-start">
          <div className="flex flex-col gap-3">
            <div
              ref={imageWrapRef}
              className={`rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 backdrop-blur-xl shadow-xl border border-white/20 flex items-center justify-center h-[500px] sm:h-[600px] lg:h-[min(85vh,900px)] p-2 md:p-3 overflow-hidden relative group ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
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
                className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 hover:bg-white shadow-lg border border-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
              >
                <Maximize2 className="w-5 h-5 text-purple-600" />
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
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 px-1">
              {((product.image ?? []).length ? product.image : [
                `https://source.unsplash.com/featured/160x160/${(product.subcategory || product.category || 'fashion').replace(/\s+/g, '+')}`
              ]).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden group/thumb ${
                    currentImageIndex === index 
                      ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg transform scale-105' 
                      : 'border border-white/20 hover:ring-2 hover:ring-purple-400 hover:ring-offset-1 hover:shadow-md transform hover:scale-105'
                  } transition-all duration-300`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-20 self-start lg:max-h-[calc(100vh-180px)] lg:overflow-auto lg:pr-4">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 rounded-full">{product.brand}</Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-text-shine tracking-tight">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                {product.reviewCount} reviews
              </span>
            </div>
            {/* Product Description */}
            {product.description && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl border border-white/20">
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-3">Description</h3>
                <div className={`text-sm text-gray-700 dark:text-gray-300 space-y-1 whitespace-pre-wrap overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-32'}`}>
                  {formatDescription(product.description)}
                </div>
                {product.description.split('\n').length > 3 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    {showFullDescription ? (
                      <>
                        Show less
                        <ChevronLeft className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Read more
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl border border-white/20">
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-3">Product Features</h3>
              {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                <>
                  <ul className={`text-sm space-y-2 overflow-hidden transition-all duration-300 ${showFullFeatures ? 'max-h-none' : 'max-h-40'}`}>
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${index % 2 === 0 ? 'bg-purple-400' : 'bg-pink-400'}`}></span>
                        <span className="text-gray-700 dark:text-gray-300">{formatDescription(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  {product.features.length > 5 && (
                    <button
                      onClick={() => setShowFullFeatures(!showFullFeatures)}
                      className="mt-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      {showFullFeatures ? (
                        <>
                          Show less
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        </>
                      ) : (
                        <>
                          Read more
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <ul className="text-sm space-y-2">
                  {product.category === 'Shirt' || product.category === 'T-Shirt' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">100% Premium Cotton</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Comfortable Regular Fit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Machine Washable</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Breathable Fabric</span>
                      </li>
                    </>
                  ) : product.category === 'Jeans' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Durable Denim Material</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Perfect Fit Design</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Multiple Pockets</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Fade Resistant</span>
                      </li>
                    </>
                  ) : product.category === 'Shoes' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Comfortable Cushioning</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Durable Sole</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Breathable Design</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Perfect for Daily Use</span>
                      </li>
                    </>
                  ) : product.category === 'Accessories' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Premium Quality Material</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Stylish Design</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Long Lasting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Perfect for Any Occasion</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Premium Quality Material</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Comfortable Fit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Durable Design</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="text-gray-700 dark:text-gray-300">Easy Maintenance</span>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">₹{product.price}</span>
              {(() => {
                // Calculate discount display
                const basePrice = product.basePrice || product.price;
                const discount = product.discount;
                let showDiscount = false;
                let discountPercent = 0;
                let oldPrice = basePrice;
                
                if (discount && typeof discount === 'object' && discount.value > 0) {
                  if (discount.type === 'percentage') {
                    discountPercent = discount.value;
                    showDiscount = true;
                  } else if (discount.type === 'fixed' && basePrice > product.price) {
                    discountPercent = ((basePrice - product.price) / basePrice) * 100;
                    showDiscount = true;
                  }
                } else if (typeof discount === 'number' && discount > 0) {
                  // Legacy discount format
                  discountPercent = discount;
                  showDiscount = true;
                } else if (basePrice > product.price) {
                  // Calculate from price difference
                  discountPercent = ((basePrice - product.price) / basePrice) * 100;
                  showDiscount = discountPercent > 0;
                }
                
                return showDiscount ? (
                  <>
                    <span className="text-lg md:text-xl text-muted-foreground line-through">₹{basePrice.toFixed(2)}</span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                      {Math.round(discountPercent)}% OFF
                    </Badge>
                  </>
                ) : null;
              })()}
              {outOfStock ? (
                <Badge className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">Out of Stock</Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full font-bold text-sm">In Stock</Badge>
              )}
            </div>
            {!outOfStock && (
              <p className="text-sm text-muted-foreground -mt-2">{availableStock} item{availableStock === 1 ? '' : 's'} left</p>
            )}

            {/* Size and Color Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <label className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 block">Size</label>
                {product.size?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(size);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          selectedSize === size
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                            : 'bg-white/50 dark:bg-white/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No size options available</p>}
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <label className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 block">Color</label>
                {product.color?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedColor(color);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          selectedColor === color
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                            : 'bg-white/50 dark:bg-white/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No color options available</p>}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <label className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1 || outOfStock}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    quantity <= 1 || outOfStock
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-bold text-xl w-12 text-center bg-white/50 dark:bg-black/20 rounded-xl py-1.5">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={outOfStock || (availableStock > 0 && quantity >= availableStock)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    outOfStock || (availableStock > 0 && quantity >= availableStock)
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || (availableStock > 0 && quantity > availableStock)}
                className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all duration-300 group relative overflow-hidden ${
                  outOfStock || (availableStock > 0 && quantity > availableStock)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-lg">Add to Cart</span>
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleAddToWishlist}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-pink-100 text-pink-500 hover:bg-pink-200'
                      : 'bg-white/50 dark:bg-black/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-pink-500 animate-heartbeat' : ''}`} />
                </button>

                <button
                  onClick={() => navigator?.share?.({ title: product.title, url: window.location.href }).catch(() => {})}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-black/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-4 backdrop-blur-xl border border-white/20 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Fast Delivery</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3-5 business days</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-4 backdrop-blur-xl border border-white/20 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Easy Returns</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Within 7 days</p>
                </div>
              </div>
            </div>

            {/* Description
            <Card className="p-3 md:p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <details open className="text-sm text-muted-foreground leading-relaxed">
                <summary className="cursor-pointer text-foreground mb-2">Read more</summary>
                <p>{product.description || 'No description available for this product.'}</p>
              </details>
            </Card> */}
          </div>
        </div>

        <div className="border-t pt-16">
          <ReviewSection productId={product._id} />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-text-shine tracking-tight">Related Products</h2>
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div key={relatedProduct._id || index} className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-3 md:p-4 hover:shadow-xl transition-all duration-300 backdrop-blur-xl border border-white/20 transform hover:scale-[1.02]">
                  <Link to={`/product/${relatedProduct._id}`} className="block">
                    <div className="aspect-square bg-white/50 dark:bg-black/20 mb-4 rounded-xl overflow-hidden relative group-hover:shadow-lg transition-all duration-300">
                      <img
                        src={Array.isArray(relatedProduct.image) ? relatedProduct.image[0] : relatedProduct.image || `https://source.unsplash.com/featured/400x400/${(relatedProduct.category || 'fashion').replace(/\s+/g, '+')}`}
                        alt={relatedProduct.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 line-clamp-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:to-purple-600">{relatedProduct.title}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">₹{relatedProduct.price}</span>
                      {relatedProduct.oldPrice && (
                        <div className="flex flex-col items-end">
                          <span className="text-gray-500 line-through text-xs">₹{relatedProduct.oldPrice}</span>
                          <span className="text-xs font-bold text-pink-500">
                            {Math.round((1 - relatedProduct.price / relatedProduct.oldPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    {relatedProduct.brand && (
                      <div className="mt-2 inline-block px-2 py-1 rounded-lg bg-white/50 dark:bg-black/20 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {relatedProduct.brand}
                      </div>
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
