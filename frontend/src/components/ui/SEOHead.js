import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateCanonicalUrl, generateSocialMetaTags } from '../../utils/seoUtils';

/**
 * SEOHead component for consistent SEO meta tags across all pages
 * @param {Object} props - SEO configuration
 */
const SEOHead = ({
  title = 'BoiBabu - India\'s Premier Online Bookstore',
  description = 'Buy books online at BoiBabu.in - India\'s largest bookstore with best prices, free shipping & fast delivery.',
  keywords = 'buy books online, online bookstore India, books online, BoiBabu',
  canonicalUrl = null,
  image = 'https://boibabu.in/og-image.jpg',
  type = 'website',
  structuredData = null,
  noIndex = false,
  noFollow = false,
  searchParams = null,
  basePath = null
}) => {
  // Generate canonical URL if not provided
  const finalCanonicalUrl = canonicalUrl || (searchParams && basePath 
    ? generateCanonicalUrl(searchParams, basePath)
    : `https://boibabu.in${window.location.pathname}`
  );

  // Generate social meta tags
  const socialMetaTags = generateSocialMetaTags({
    title,
    description,
    url: finalCanonicalUrl,
    image,
    type
  });

  // Generate robots meta content
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={socialMetaTags['og:title']} />
      <meta property="og:description" content={socialMetaTags['og:description']} />
      <meta property="og:url" content={socialMetaTags['og:url']} />
      <meta property="og:type" content={socialMetaTags['og:type']} />
      <meta property="og:image" content={socialMetaTags['og:image']} />
      <meta property="og:site_name" content={socialMetaTags['og:site_name']} />
      <meta property="og:locale" content={socialMetaTags['og:locale']} />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content={socialMetaTags['twitter:card']} />
      <meta name="twitter:title" content={socialMetaTags['twitter:title']} />
      <meta name="twitter:description" content={socialMetaTags['twitter:description']} />
      <meta name="twitter:image" content={socialMetaTags['twitter:image']} />
      <meta name="twitter:site" content={socialMetaTags['twitter:site']} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;