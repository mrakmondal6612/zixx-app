
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Testimonials from './Testimonials';
import Services from './Services';
import Newsletter from './Newsletter';

export const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
  };


  return (
    <footer className="bg-background w-full">
      {/* Customer Testimonials Section */}
      <Testimonials />

      {/* Services Section */}
      <Services />

      {/* Newsletter Section */}
      {/* <div className="bg-black py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-2">STAY UPTO DATE ABOUT</h3>
              <h3 className="text-3xl font-bold">OUR LATEST OFFERS</h3>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="flex">
                
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white rounded-full px-6 py-3 w-80"
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 font-medium"
              >
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </div>
      </div> */}
      <Newsletter />

      {/* Footer Links Section */}
      <div className="bg-[#D92030] w-full text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Exclusive Column */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Exclusive</h3>
              <h4 className="text-lg font-medium mb-4">Subscribe</h4>
              <p className="mb-4">Get 10% off your first order</p>
              <form onSubmit={handleSubmit} className="flex border border-white rounded mb-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-transparent text-white p-2 w-full outline-none placeholder-white placeholder-opacity-40"
                />
                <button type="submit" className="p-2">
                  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.25 9H18.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.25 1.5L18.75 9L11.25 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>

            {/* Support Column */}
            <div>
              <h3 className="text-xl font-medium mb-6">Support</h3>
              <address className="not-italic">
                <p className="mb-4">1, Khan Road Mankundu<br />Hooghly - 720012</p>
                <p className="mb-4">xyzabcgmail.com</p>
                <p className="mb-4">+91015-8436-9999</p>
              </address>
            </div>

            {/* Account Column */}
            <div>
              <h3 className="text-xl font-medium mb-6">Account</h3>
              <ul className="space-y-4">
                <li><Link to="/account" className="hover:underline">My Account</Link></li>
                <li><Link to="/login" className="hover:underline">Login / Register</Link></li>
                <li><Link to="/cart" className="hover:underline">Cart</Link></li>
                <li><Link to="/wishlist" className="hover:underline">Wishlist</Link></li>
                <li><Link to="/shop" className="hover:underline">Shop</Link></li>
              </ul>
            </div>

            {/* Quick Link Column */}
            <div>
              <h3 className="text-xl font-medium mb-6">Quick Link</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline">Terms Of Use</Link></li>
                <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
                <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-end mt-8 mb-10">
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="hover:opacity-80">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:opacity-80">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-80">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-80">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Footer Divider */}
          <div className="border-t border-white opacity-40 my-4"></div>
          
          {/* Copyright */}
          <div className="flex justify-center items-center">
            <span>© Copyright ZIXX. All right reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
