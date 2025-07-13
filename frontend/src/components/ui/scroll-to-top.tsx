import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ScrollToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 p-0 bg-[#D92030] hover:bg-[#BC1C2A] text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
      aria-label="Scroll to top"
    >
      <ChevronDown className="w-5 h-5 rotate-180" />
    </Button>
  );
};