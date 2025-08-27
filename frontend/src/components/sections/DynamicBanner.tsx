import React, { useEffect, useState } from 'react';
import { Banner } from './Banner';
import { apiUrl } from '@/lib/api';

interface DynamicBannerProps {
  page: string; // e.g., 'home', 'women', 'men'
  position: string; // e.g., 'hero', 'mid', 'section'
  fallback: {
    imageUrl: string;
    heading: string;
    description: string;
    linkText: string;
    linkUrl: string; // Prefer /category/... if possible
    align?: Parameters<typeof Banner>[0]['align'];
  };
  // Optional style overrides for Banner
  style?: {
    variant?: Parameters<typeof Banner>[0]['variant'];
    overlay?: Parameters<typeof Banner>[0]['overlay'];
    cta?: Parameters<typeof Banner>[0]['cta'];
    radius?: Parameters<typeof Banner>[0]['radius'];
    hover?: Parameters<typeof Banner>[0]['hover'];
  };
}

interface BannerDoc {
  _id: string;
  page: string;
  position: string;
  imageUrl: string;
  heading: string;
  description?: string;
  linkText?: string;
  linkUrl?: string;
  active?: boolean;
}

export const DynamicBanner: React.FC<DynamicBannerProps> = ({ page, position, fallback, style }) => {
  const [banner, setBanner] = useState<BannerDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const params = new URLSearchParams({ page, position, active: 'true' });
        const url = apiUrl(`/clients/banners?${params.toString()}`);
        const res = await fetch(url);
        // console.log("banner url", url);
        if (!res.ok) throw new Error('Failed to fetch banner');
        const result = await res.json();
        if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
          setBanner(result.data[0]);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('DynamicBanner fetch failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [page, position]);

  const img = banner?.imageUrl || fallback.imageUrl;
  const heading = banner?.heading || fallback.heading;
  const desc = banner?.description || fallback.description;
  const linkText = banner?.linkText || fallback.linkText;
  let linkUrl = banner?.linkUrl || fallback.linkUrl;
  const isAbsolute = /^https?:\/\//i.test(linkUrl);
  if (!isAbsolute && linkUrl && !linkUrl.startsWith('/')) {
    linkUrl = '/' + linkUrl;
  }
  const align = fallback.align;

  return (
    <Banner
      imageUrl={img}
      heading={heading}
      description={desc}
      linkText={linkText}
      linkUrl={linkUrl}
      align={align}
      variant={style?.variant}
      overlay={style?.overlay}
      cta={style?.cta}
      radius={style?.radius}
      hover={style?.hover}
    />
  );
};
