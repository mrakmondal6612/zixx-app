import { Star } from 'lucide-react';
import React from 'react'

export default function Testimonials() {
    const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."
    },
    {
      name: "Alex K.",
      rating: 5,
      text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
    },
    {
      name: "James L.",
      rating: 5,
      text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."
    }
  ];
  return (
    <div>
      {/* Customer Testimonials Section */}
      <div className="bg-background py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-6xl font-extrabold text-center mb-12 text-foreground">OUR HAPPY CUSTOMERS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-6 rounded-lg border ${index === 0 ? 'border-primary' : 'border-border'}`}>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center mb-3">
                  <span className="font-semibold text-foreground">{testimonial.name}</span>
                  <div className="w-5 h-5 bg-green-500 rounded-full ml-2 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
