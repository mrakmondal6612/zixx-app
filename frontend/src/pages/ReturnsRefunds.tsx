import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer/Footer';

const ReturnsRefunds = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Returns & Refunds</h1>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Return Window</h2>
            <p className="mb-6 text-gray-600">
              You can request a return within <strong>7 days</strong> of delivery for eligible products. Items must be 
              unused, unwashed, and in their original condition with all tags and packaging intact.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Product is in original condition with tags and packaging.</li>
              <li>No signs of wear, stains, or damage.</li>
              <li>Return is requested within the stated return window.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 mb-6 text-gray-600">
              <li>Go to <strong>My Orders</strong> in your account.</li>
              <li>Select the order and item you want to return.</li>
              <li>Choose a reason and preferred resolution (refund/exchange if available).</li>
              <li>Submit the request; our courier will schedule a pickup where applicable.</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">Exchange</h2>
            <p className="mb-6 text-gray-600">
              Exchanges are subject to stock availability. If the requested size/style is unavailable, we will process a refund as per the refund method below.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Prepaid orders: Refund to original payment method within 3–7 business days after quality check.</li>
              <li>Cash on Delivery (COD): Refund via bank transfer or store credit within 3–7 business days after quality check.</li>
              <li>Shipping fees (if any) are non-refundable unless the return is due to a defective/wrong item.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
            <p className="mb-6 text-gray-600">
              Certain items may not be eligible for returns due to hygiene or other reasons (e.g., innerwear, socks, personalized items). Such exclusions will be mentioned on the product page.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Damaged or Wrong Item</h2>
            <p className="mb-6 text-gray-600">
              If you receive a damaged, defective, or incorrect item, please raise a return request within 48 hours of delivery and include photos of the product and packaging for faster resolution.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Cancellations</h2>
            <p className="mb-6 text-gray-600">
              Orders can be cancelled before they are shipped. If already shipped, please refuse delivery or initiate a return after delivery.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-gray-600">
              For any queries, write to us at
              <a href="mailto:contact@zixxapp.com" className="text-black underline"> contact@zixxapp.com</a>
              with your order ID, and we’ll be happy to assist.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsRefunds;
