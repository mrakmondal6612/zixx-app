// components/TopBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, User, LogOut } from 'lucide-react';
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
        {/* Mobile Menu Toggle removed: Men/Women/Kids now live in MainNav drawer */}

        {/* Nav Links */}
        <nav className={
          `${isMobile ? 'hidden' : 'flex flex-row'} items-stretch text-sm font-bold text-center uppercase ml-0`
        }>
          {['women', 'men', 'kids'].map(tab => (
            <Link 
              key={tab}
              to={`/${tab}`}
              className={`flex-1 md:flex-none min-w-[90px] md:min-w-0 md:w-[114px] px-px border-x border-[#52505] transition-all duration-300 hover:scale-105 ${
                activeTab === tab 
                  ? 'bg-white text-black transform scale-105' 
                  : 'text-white hover:bg-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              <div className="font-bold leading-[21px] py-3">{tab.toUpperCase()}</div>
            </Link>
          ))}

          {/* Desktop-only tabs; mobile uses MainNav drawer quick links */}
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

          {/* Track Order + Contact (visible for all) */}
          <>
            <Link to="/track-order" className="text-white text-xs md:text-sm font-normal leading-[19.5px] hover:underline ml-2">
              Track Order
            </Link>
            <Link to="/contact" className="text-white text-xs md:text-sm font-normal leading-[19.5px] hover:underline ml-2">
              Contact Us
            </Link>
          </>

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
