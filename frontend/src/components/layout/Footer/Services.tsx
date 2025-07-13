import React from 'react'
import { Truck, Star, Facebook, Twitter, Instagram, Linkedin, Headset, ShieldCheckIcon } from 'lucide-react';

export default function Services() {
      const services = [
    {
      icon: Truck,
      title: "FREE AND FAST DELIVERY",
      description: "Free delivery for all orders over $140"
    },
    {
      icon: Headset,
      title: "24/7 CUSTOMER SERVICE",
      description: "Friendly 24/7 customer support"
    },
    {
      icon: ShieldCheckIcon,
      title: "MONEY BACK GUARANTEE",
      description: "We return money within 30 days"
    }
  ];
  return (
    <div>
        <div className="bg-background py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
