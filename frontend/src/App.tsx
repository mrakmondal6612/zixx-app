
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import Brands from "./pages/Brands";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Kids from "./pages/Kids";
import Signup from "./pages/Signup";
import Shop from "./pages/Shop";
import OnSale from "./pages/OnSale";
import NewArrivals from "./pages/NewArrivals";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import Search from "./pages/Search";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";
import Clothes from "./pages/Clothes";
import Accessories from "./pages/Accessories";
import Collections from "./pages/Collections";
import FeaturedCollection from "./pages/FeaturedCollection";
import Product from "./pages/Product";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/women" element={<Women />} />
          <Route path="/men" element={<Men />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/on-sale" element={<OnSale />} />
          <Route path="/sale" element={<OnSale />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/search" element={<Search />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/clothes" element={<Clothes />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/featured-collection" element={<FeaturedCollection />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/product" element={<Product />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
