// components/TopBar.jsx
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
    <div className="bg-[rgba(34,40,40,1)] w-full flex flex-col items-stretch justify-center px-3 md:px-6 lg:px-80">
      <div className="flex min-h-[45px] w-full items-center gap-2 md:gap-8 justify-between flex-wrap sm:flex-nowrap">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 rounded-md border border-white/20 bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Nav Links */}
        <nav className={
          `${isMobile ? (mobileMenuOpen ? 'flex flex-col absolute top-[48px] left-0 right-0 bg-[rgba(34,40,40,1)] z-50 p-3 space-y-2' : 'hidden') : 'flex flex-row'} items-stretch text-sm font-bold text-center uppercase ml-0`
        }>
          {['women', 'men', 'kids'].map(tab => (
            <Link 
              key={tab}
              to={`/${tab}`}
              className={`w-[70px] md:w-[114px] px-px border-x border-[#52505] transition-all duration-300 hover:scale-105 ${
                activeTab === tab 
                  ? 'bg-white text-black transform scale-105' 
                  : 'text-white hover:bg-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab);
                if (isMobile) setMobileMenuOpen(false);
              }}
            >
              <div className="font-bold leading-[21px] py-3">{tab.toUpperCase()}</div>
            </Link>
          ))}

          {/* Country Selector + Track/Contact - Mobile only inside dropdown */}
          {isMobile && mobileMenuOpen && user && (
            <div className="flex flex-col gap-2 mt-4">
              {/* Country Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold whitespace-nowrap leading-[1.1] bg-white/10 rounded px-2 py-1 text-white">
                  <img src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/c20d732439d086a64aed116707cf0bd74a991145?placeholderIfAbsent=true" className="w-4" alt="Location" />
                  <span>{selectedCountry}</span>
                  <ChevronDown className="w-3 h-3 text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                  {countries.map(country => (
                    <DropdownMenuItem
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${selectedCountry === country ? 'bg-gray-50 font-medium' : ''}`}
                    >
                      {country}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Track/Contact */}
              <Link to="/track-order" className="text-white text-xs py-1 px-2 rounded bg-white/10 text-center">Track Order</Link>
              <Link to="/contact" className="text-white text-xs py-1 px-2 rounded bg-white/10 text-center">Contact Us</Link>
            </div>
          )}
        </nav>

        {/* Account + Location + Actions — Always Visible */}
        <div className="z-10 ml-auto flex items-center gap-1 md:gap-2.5 text-white">
          {/* Country Selector (always visible) */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 md:gap-[5px] text-xs md:text-sm font-bold whitespace-nowrap leading-[1.1] hover:opacity-80 transition-opacity">
              <img src="https://cdn.builder.io/api/v1/image/assets/70ad6d2d96f744648798836a6706b9db/c20d732439d086a64aed116707cf0bd74a991145?placeholderIfAbsent=true" className="w-2.5" alt="Location" />
              <div>{selectedCountry}</div>
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-50">
              {countries.map(country => (
                <DropdownMenuItem
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${selectedCountry === country ? 'bg-gray-50 font-medium' : ''}`}
                >
                  {country}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Track Order + Contact */}
          {user && (
            <>
              <Link to="/track-order" className="text-white text-xs md:text-sm font-normal leading-[19.5px] hover:underline ml-2">
                Track Order
              </Link>
              <Link to="/contact" className="text-white text-xs md:text-sm font-normal leading-[19.5px] hover:underline ml-2">
                Contact Us
              </Link>
            </>
          )}

          {/* User Dropdown */}
          {loading ? (
            <div className="text-xs md:text-sm font-normal leading-[19.5px] ml-2">Loading...</div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-xs md:text-sm font-normal leading-[19.5px] hover:opacity-80 transition-opacity ml-2">
                <img
                  src={user.profile_pic || "/placeholder.svg"}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover border border-gray-300 bg-white"
                />
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
            <Link to="/auth" className="text-white text-xs md:text-sm font-normal leading-[19.5px] hover:underline ml-2">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
