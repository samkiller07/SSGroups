import { MetadataRoute } from 'next';
import { BRANDS } from '@/config/brands';
import { dataRepository } from '@/lib/data-store';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ss-multibrand.vercel.app';
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Add brand-specific pages and catalog items
  Object.keys(BRANDS).forEach((brandId) => {
    routes.push(
      {
        url: `${baseUrl}/${brandId}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${brandId}/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/${brandId}/contact`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    );

    const items = dataRepository.getCatalogItems(brandId);
    items.forEach((item) => {
      routes.push({
        url: `${baseUrl}/${brandId}/products/${item.slug}`,
        lastModified: new Date(item.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return routes;
}
