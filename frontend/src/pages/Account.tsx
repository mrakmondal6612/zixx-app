
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const Account = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-4">
            <Card className="bg-[#D92030] text-white hover:bg-[#BC1C2A] transition-colors">
              <CardContent className="p-4">
                <Link to="/account" className="flex items-center gap-3">
                  <User size={20} />
                  <span className="font-medium">Account Details</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/orders" className="flex items-center gap-3">
                  <ShoppingBag size={20} />
                  <span className="font-medium">Orders</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/wishlist" className="flex items-center gap-3">
                  <Heart size={20} />
                  <span className="font-medium">Wishlist</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Link to="/logout" className="flex items-center gap-3 text-gray-500">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </Link>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <div className="space-y-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button className="bg-[#D92030] hover:bg-[#BC1C2A]">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="123 Main Street"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="Apt 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="United States"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button className="bg-[#D92030] hover:bg-[#BC1C2A]">
                    Save Address
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button className="bg-[#D92030] hover:bg-[#BC1C2A]">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Account;
