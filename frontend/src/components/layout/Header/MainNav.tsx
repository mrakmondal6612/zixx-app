
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, ShoppingCart, ChevronDown, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export const MainNav = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      // Navigate to search page with query parameter
      window.location.href = `/search?q=${encodeURIComponent(searchText.trim())}`;
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if current route is cart to highlight the cart icon
  const isCartPage = location.pathname === '/cart';
  const isWishlistPage = location.pathname === '/wishlist';

  return (
    <>
      <div className="self-center flex w-full max-w-[1331px] items-center justify-between responsive-padding-x mt-[13px] relative">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/7cca860fedc8680dd550e361a158b91fff3bb621?placeholderIfAbsent=true" 
              className="aspect-[1.02] object-contain w-8 xs:w-10 md:w-14 shrink-0" 
              alt="Logo" 
            />
          </Link>
          <Link to="/" className="text-[rgba(33,33,33,1)] text-lg xs:text-xl md:text-[32px] font-bold ml-2 md:ml-4">
            ZIXX
          </Link>
        </div>

        {isMobile ? (
          <button onClick={toggleMenu} className="text-[rgba(33,33,33,1)] z-50" aria-label="Menu">
            <Menu size={24} />
          </button>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 xl:gap-8 justify-center flex-1 max-w-none">
            
            {/* Navigation Menu */}
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm lg:text-base text-black">Shop</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/categories/featured"
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              Featured Collection
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Check out our latest arrivals and exclusive items
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/categories/clothes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Clothes</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            T-shirts, Hoodies, Joggers and more
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/categories/accessories" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Accessories</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Bags, Caps, Socks and Essentials
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/categories/collections" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Collections</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Themed collections and limited editions
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/sale" className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-2 lg:px-4 py-2 text-sm lg:text-base text-black hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}>
                    On Sale
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/new-arrivals" className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-2 lg:px-4 py-2 text-sm lg:text-base text-black hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}>
                    New Arrivals
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/brands" className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-2 lg:px-4 py-2 text-sm lg:text-base text-black hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}>
                    Brands
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Search Bar - Responsive */}
            <form onSubmit={handleSearch} className="bg-[rgba(240,240,240,1)] flex w-full max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[400px] xl:max-w-[500px] gap-2 sm:gap-3 overflow-hidden rounded-[62px] px-3 sm:px-4 py-2 sm:py-3">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/6b478e42f8403dc6f5eae99c7cf3bb374642f221?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-4 sm:w-5 shrink-0" 
                alt="Search" 
              />
              <input 
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="bg-transparent outline-none w-full text-sm sm:text-base text-black placeholder:text-gray-500"
              />
            </form>
            
            {/* Icons Section */}
            <div className="flex gap-2 sm:gap-3 lg:gap-3.5 items-center flex-shrink-0">
              <Link to="/auth" aria-label="Login/Account" className={location.pathname === '/auth' ? "relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-[#D92030] after:rounded-full" : ""}>
                <User size={20} className="sm:w-6 sm:h-6 hover:opacity-80 transition-opacity" />
              </Link>
              <Link to="/cart" aria-label="Shopping cart" className={isCartPage ? "relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-[#D92030] after:rounded-full" : ""}>
                <ShoppingCart size={20} className={`sm:w-6 sm:h-6 hover:opacity-80 transition-opacity ${isCartPage ? 'opacity-70' : ''}`} />
              </Link>
              <Link to="/wishlist" aria-label="Wishlist" className={isWishlistPage ? "relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-[#D92030] after:rounded-full" : ""}>
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/ac715f0dd7f9aaef44ddb1306739d29ec63e93de?placeholderIfAbsent=true" 
                  className="aspect-[1] object-contain w-5 sm:w-6 shrink-0 hover:opacity-80 transition-opacity" 
                  alt="Wishlist" 
                />
              </Link>
              <Link to="/admin" aria-label="Admin panel" className={location.pathname === '/admin' ? "relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-[#D92030] after:rounded-full" : ""}>
                <User size={20} className="sm:w-6 sm:h-6 hover:opacity-80 transition-opacity text-red-600" />
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white z-50 shadow-lg p-4 border-t border-gray-200">
          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/shop" className="text-lg font-medium flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                Shop
                <span>→</span>
              </Link>
            </li>
            <li>
              <Link to="/sale" className="text-lg" onClick={() => setIsMenuOpen(false)}>On Sale</Link>
            </li>
            <li>
              <Link to="/new-arrivals" className="text-lg" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
            </li>
            <li>
              <Link to="/brands" className="text-lg" onClick={() => setIsMenuOpen(false)}>Brands</Link>
            </li>
            <li className="mt-4">
              <form onSubmit={handleSearch} className="bg-[rgba(240,240,240,1)] flex gap-3 overflow-hidden rounded-[62px] px-4 py-3 w-full">
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/6b478e42f8403dc6f5eae99c7cf3bb374642f221?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-5 shrink-0" 
                  alt="Search" 
                />
                <input 
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for products..."
                  className="bg-transparent outline-none w-full"
                />
              </form>
            </li>
            <li className="flex gap-4 mt-4 justify-around">
              <Link to="/account" aria-label="User account" className="flex flex-col items-center" onClick={() => setIsMenuOpen(false)}>
                <User size={24} className="mb-1" />
                <span className="text-sm">Account</span>
              </Link>
              <Link to="/cart" aria-label="Shopping cart" className={`flex flex-col items-center ${isCartPage ? 'text-[#D92030]' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <ShoppingCart size={24} className="mb-1" />
                <span className="text-sm">Cart</span>
              </Link>
              <Link to="/wishlist" aria-label="Wishlist" className="flex flex-col items-center" onClick={() => setIsMenuOpen(false)}>
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/ac715f0dd7f9aaef44ddb1306739d29ec63e93de?placeholderIfAbsent=true" 
                  className="aspect-[1] object-contain w-6 mb-1" 
                  alt="Wishlist" 
                />
                <span className="text-sm">Wishlist</span>
              </Link>
              <Link to="/admin" aria-label="Admin panel" className="flex flex-col items-center" onClick={() => setIsMenuOpen(false)}>
                <User size={24} className="mb-1 text-red-600" />
                <span className="text-sm">Admin</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
