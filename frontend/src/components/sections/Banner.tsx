import React from 'react';
import { Link } from 'react-router-dom';

type BannerAlignment =
  | 'left'
  | 'center'
  | 'right'
  | 'top-left-corner'
  | 'top-right-corner'
  | 'bottom-left-corner'
  | 'bottom-right-corner'
  | 'middle-bottom'
  | 'middle-up';

interface BannerProps {
  imageUrl: string;
  heading: string;
  description: string;
  linkText: string;
  linkUrl: string;
  align?: BannerAlignment;
}

export const Banner: React.FC<BannerProps> = ({
  imageUrl,
  heading,
  description,
  linkText,
  linkUrl,
  align = 'left',
}) => {
  const alignmentClasses: Record<BannerAlignment, string> = {
    left: 'items-start text-left justify-center',
    center: 'items-center text-center justify-center',
    right: 'items-end text-right justify-center',
    'top-left-corner': 'items-start text-left justify-start',
    'top-right-corner': 'items-end text-right justify-start',
    'bottom-left-corner': 'items-start text-left justify-end',
    'bottom-right-corner': 'items-end text-right justify-end',
    'middle-bottom': 'items-center text-center justify-end',
    'middle-up': 'items-center text-center justify-start',
  };

  return (
    <section className="mb-16">
      <div className="relative w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={heading}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col p-8 ${alignmentClasses[align]}`}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {heading}
          </h2>
          <p className="text-white max-w-md mb-6">{description}</p>
          <Link
            to={linkUrl}
            className="bg-white text-black px-6 py-2 rounded-md inline-block font-medium hover:bg-gray-100 transition-colors w-max h-max"
          >
            {linkText}
          </Link>
        </div>
      </div>
    </section>
  );
};
