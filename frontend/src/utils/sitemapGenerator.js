/**
 * Dynamic sitemap generation utility
 * This can be used to generate sitemaps programmatically
 */

import { BOOK_CATEGORIES } from '../constants/categories';

/**
 * Generate sitemap URLs with proper canonical structure
 * @returns {Array} Array of sitemap URL objects
 */
export const generateSitemapUrls = () => {
  const baseUrl = 'https://boibabu.in';
  const currentDate = new Date().toISOString();
  
  const urls = [
    // Homepage
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    
    // Main books page
    {
      loc: `${baseUrl}/books`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    
    // Category pages - using proper URL encoding
    ...BOOK_CATEGORIES.map(category => ({
      loc: `${baseUrl}/books?category=${encodeURIComponent(category)}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    })),
    
    // Special collections
    {
      loc: `${baseUrl}/books?featured=true`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/books?bestseller=true`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/books?newArrival=true`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    
    // Auth pages
    {
      loc: `${baseUrl}/login`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      loc: `${baseUrl}/register`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    }
  ];
  
  return urls;
};

/**
 * Generate XML sitemap content
 * @param {Array} urls - Array of URL objects
 * @returns {string} XML sitemap content
 */
export const generateSitemapXML = (urls = null) => {
  const sitemapUrls = urls || generateSitemapUrls();
  
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;
  
  const xmlUrls = sitemapUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');
  
  const xmlFooter = `
</urlset>`;
  
  return xmlHeader + xmlUrls + xmlFooter;
};

/**
 * Add book URLs to sitemap (for dynamic generation)
 * @param {Array} books - Array of book objects
 * @returns {Array} Array of book URL objects
 */
export const generateBookUrls = (books) => {
  const baseUrl = 'https://boibabu.in';
  const currentDate = new Date().toISOString();
  
  return books.map(book => ({
    loc: `${baseUrl}/books/${book._id}`,
    lastmod: book.updatedAt || currentDate,
    changefreq: 'weekly',
    priority: '0.7'
  }));
};