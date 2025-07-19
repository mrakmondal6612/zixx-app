
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, MapPin, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/hooks/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const TopBar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/women')) return 'women';
    if (location.pathname.includes('/men')) return 'men';
    if (location.pathname.includes('/kids')) return 'kids';
    return 'home';
  });
  
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const { user, logout, loading } = useAuthContext();
  
  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Japan', 'South Korea', 'Singapore', 'UAE', 
    'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway'
  ];

  return (
    <div className="bg-[rgba(34,40,40,1)] flex h-[48px] w-full flex-col items-stretch justify-center px-3 md:px-6 lg:px-80">
      <div className="flex min-h-[45px] w-full items-center gap-4 md:gap-8 justify-between">
        {/* Mobile menu toggle */}
        {isMobile && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-1"
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Main navigation - shifted to left */}
        <nav className={`${isMobile && !mobileMenuOpen ? 'hidden' : 'flex'} ${isMobile ? 'absolute top-[41px] left-0 right-0 bg-[rgba(34,40,40,1)] z-50 flex-col' : 'static flex-row'} items-stretch text-sm font-bold text-center uppercase ml-0`}>
          <Link 
            to="/women"
            className={`leading-loose w-[70px] md:w-[114px] px-px border-x-[1px] border-x-[#52505] border-solid transition-all duration-300 hover:scale-105 ${
              activeTab === 'women' 
                ? 'bg-white text-black transform scale-105' 
                : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => {
              setActiveTab('women');
              if (isMobile) setMobileMenuOpen(false);
            }}
          >
            <div className="font-bold leading-[21px] py-3">WOMEN</div>
          </Link>
          <Link 
            to="/men"
            className={`whitespace-nowrap leading-loose w-[70px] md:w-[113px] pr-px border-r-[1px] border-r-[#52505] border-solid transition-all duration-300 hover:scale-105 ${
              activeTab === 'men' 
                ? 'bg-white text-black transform scale-105' 
                : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => {
              setActiveTab('men');
              if (isMobile) setMobileMenuOpen(false);
            }}
          >
            <div className="leading-[21px] py-3">MEN</div>
          </Link>
          <Link 
            to="/kids"
            className={`w-[70px] md:w-[113px] pr-px border-r-[1px] border-r-[#52505] border-solid transition-all duration-300 hover:scale-105 ${
              activeTab === 'kids' 
                ? 'bg-white text-black transform scale-105' 
                : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => {
              setActiveTab('kids');
              if (isMobile) setMobileMenuOpen(false);
            }}
          >
            <div className="text-sm font-black leading-[21px] py-3">KIDS</div>
          </Link>
        </nav>
        
        <div className="z-10 ml-auto flex items-center gap-1 md:gap-2.5 text-white">
          {/* Location Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 md:gap-[5px] text-xs md:text-sm font-bold whitespace-nowrap leading-[1.1] hover:opacity-80 transition-opacity">
              <img src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/c20d732439d086a64aed116707cf0bd74a991145?placeholderIfAbsent=true" className="aspect-[0.56] object-contain w-2 md:w-2.5 shrink-0" alt="Location icon" />
              <div className="text-white text-xs md:text-sm font-bold leading-[15.4px]">
                {selectedCountry}
              </div>
              <ChevronDown className="w-3 h-3 text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-50">
              {countries.map((country) => (
                <DropdownMenuItem
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                    selectedCountry === country ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {country}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-[13px] font-normal uppercase">
            <Link to="/track-order" className="flex items-center hover:underline">
              <span className="hidden md:inline ml-1">Track Order</span>
            </Link>
            <Link to="/contact" className="text-white text-[10px] md:text-[13px] font-normal leading-[19.5px] hover:underline ml-1 md:ml-2">
              Contact Us
            </Link>
            
            {/* User Authentication Section */}
            {loading ? (
              <div className="text-white text-[10px] md:text-[13px] font-normal leading-[19.5px] ml-1 md:ml-2">
                Loading...
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-white text-[10px] md:text-[13px] font-normal leading-[19.5px] hover:opacity-80 transition-opacity ml-1 md:ml-2">
                  <User className="w-3 h-3" />
                  <span className="hidden md:inline">
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-50" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                      <User className="w-4 h-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="text-white text-[10px] md:text-[13px] font-normal leading-[19.5px] hover:underline ml-1 md:ml-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
