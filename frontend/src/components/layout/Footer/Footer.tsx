
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Clock, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import Testimonials from './Testimonials';
import Services from './Services';
import Newsletter from './Newsletter';

export const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  // Set active link based on current route
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail('');
      toast({
        title: 'Subscribed!',
        description: 'Thank you for subscribing to our newsletter',
      });
      
      // Reset subscription status after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'Failed to subscribe. Please try again later.',
        variant: 'destructive',
      });
    }
  };


  return (
    <footer className="w-full">
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
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Exclusive</h3>
              <h4 className="text-lg font-medium">Subscribe</h4>
              <p>Get 10% off your first order</p>
              {isSubscribed ? (
                <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex border-2 border-white rounded-lg overflow-hidden">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white/10 backdrop-blur-sm text-white p-3 w-full outline-none placeholder-white/70"
                    required
                  />
                  <button 
                    type="submit" 
                    className="bg-white text-[#D92030] px-4 hover:bg-gray-100 transition-colors"
                    disabled={!email}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>

            {/* Support Column */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Support</h3>
              <address className="not-italic space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>1, Khan Road Mankundu<br />Hooghly - 720012<br />West Bengal, India</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href="mailto:contact@zixxapp.com" className="hover:underline">contact@zixxapp.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a href="tel:+9101584369999" className="hover:underline">+91 01584 369999</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <p>Mon-Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </address>
            </div>

            {/* Account Column */}
            <div>
              <h3 className="text-xl font-medium mb-6">Account</h3>
              <ul className="space-y-3">
                {[
                  { to: '/account', label: 'My Account' },
                  { to: '/auth', label: 'Login / Register' },
                  { to: '/cart', label: 'Cart' },
                  { to: '/wishlist', label: 'Wishlist' },
                  { to: '/shop', label: 'Shop' }
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link 
                      to={to} 
                      className={`transition-colors hover:text-white ${activeLink === to ? 'text-white font-medium' : 'text-white/80'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Link Column */}
            <div>
              <h3 className="text-xl font-medium mb-6">Quick Link</h3>
              <ul className="space-y-3">
                {[
                  { to: '/privacy-policy', label: 'Privacy Policy' },
                  { to: '/terms', label: 'Terms Of Use' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/contact', label: 'Contact Us' }
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link 
                      to={to} 
                      className={`transition-colors hover:text-white ${activeLink === to ? 'text-white font-medium' : 'text-white/80'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 mb-10">
            <div className="flex items-center gap-2">
              <span className="text-sm">Follow us:</span>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/zixxapp' },
                  { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/zixxapp' },
                  { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/zixxapp' },
                  { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/zixxapp' }
                ].map(({ icon: Icon, label, url }) => (
                  <a 
                    key={label}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm">Download our app:</span>
              <div className="flex gap-2">
                <a 
                  href="#" 
                  className="bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: 'Coming Soon!',
                      description: 'Our mobile app will be available soon.'
                    });
                  }}
                >
                  App Store
                </a>
                <a 
                  href="#" 
                  className="bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: 'Coming Soon!',
                      description: 'Our mobile app will be available soon.'
                    });
                  }}
                >
                  Google Play
                </a>
              </div>
            </div>
          </div>

          {/* Footer Divider */}
          <div className="border-t border-white/20 my-6"></div>
          
          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
            <div className="text-center md:text-left">
              © {new Date().getFullYear()} ZIXX. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link to="/shipping" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <span>•</span>
              <Link to="/returns" className="hover:text-white transition-colors">
                Returns & Refunds
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <span className="text-red-400">❤️</span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
