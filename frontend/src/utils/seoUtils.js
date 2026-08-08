/**
 * SEO utility functions for canonical URLs and meta tags
 */

/**
 * Normalize URL parameters for consistent canonical URLs
 * @param {URLSearchParams} searchParams - Current URL search parameters
 * @param {string} basePath - Base path for the URL (e.g., '/books')
 * @returns {string} - Normalized canonical URL
 */
export const generateCanonicalUrl = (searchParams, basePath = '') => {
  const baseUrl = 'https://boibabu.in';
  
  // Define parameter priority order for consistent URLs
  const paramOrder = [
    'category',
    'search', 
    'sortBy',
    'sortOrder',
    'minPrice',
    'maxPrice',
    'featured',
    'bestseller',
    'newArrival',
    'language'
  ];
  
  // Extract only non-empty parameters
  const normalizedParams = new URLSearchParams();
  
  paramOrder.forEach(param => {
    const value = searchParams.get(param);
    if (value && value.trim() !== '') {
      normalizedParams.set(param, value.trim());
    }
  });
  
  // Build canonical URL
  const queryString = normalizedParams.toString();
  const fullPath = basePath || window.location.pathname;
  
  return queryString 
    ? `${baseUrl}${fullPath}?${queryString}`
    : `${baseUrl}${fullPath}`;
};

/**
 * Generate SEO metadata based on current page and filters
 * @param {Object} options - SEO generation options
 * @returns {Object} - SEO metadata object
 */
export const generateSEOMetadata = (options = {}) => {
  const {
    filters = {},
    customTitle = '',
    customDescription = '',
    customKeywords = '',
    totalResults = 0
  } = options;
  
  let title = 'Buy Books Online - BoiBabu.in';
  let description = 'Buy books online at BoiBabu.in - India\'s largest bookstore with best prices, free shipping & fast delivery.';
  let keywords = 'buy books online, online bookstore India, books online, BoiBabu';
  
  // Custom overrides
  if (customTitle) {
    title = customTitle;
  } else if (filters.search) {
    title = `${filters.search} Books - Buy Online at BoiBabu.in`;
    description = `Find ${filters.search} books online at BoiBabu.in. Best prices, free shipping, and fast delivery across India.`;
    keywords = `${filters.search} books, buy ${filters.search} online, ${filters.search} book store, ${keywords}`;
  } else if (filters.category) {
    title = `${filters.category} Books - Buy Online at BoiBabu.in`;
    description = `Shop ${filters.category} books online at BoiBabu.in. Huge collection of ${filters.category} books with best prices and free shipping.`;
    keywords = `${filters.category} books, buy ${filters.category} books online, ${filters.category} book store, ${keywords}`;
  } else if (filters.featured === 'true') {
    title = 'Featured Books - Buy Online at BoiBabu.in';
    description = 'Discover featured books at BoiBabu.in. Handpicked collection of the best books with special offers and free shipping.';
    keywords = `featured books, recommended books, best books, ${keywords}`;
  } else if (filters.bestseller === 'true') {
    title = 'Bestseller Books - Buy Online at BoiBabu.in';
    description = 'Shop bestseller books at BoiBabu.in. Popular and trending books with best prices and free shipping across India.';
    keywords = `bestseller books, popular books, trending books, ${keywords}`;
  } else if (filters.newArrival === 'true') {
    title = 'New Arrival Books - Buy Online at BoiBabu.in';
    description = 'Latest new arrival books at BoiBabu.in. Fresh collection of newly released books with best prices and free shipping.';
    keywords = `new books, latest books, new arrivals, ${keywords}`;
  }
  
  // Add custom description and keywords if provided
  if (customDescription) {
    description = customDescription;
  }
  if (customKeywords) {
    keywords = customKeywords;
  }
  
  // Add result count to description if available
  if (totalResults > 0) {
    description = `${description} Browse ${totalResults} books available.`;
  }
  
  return {
    title,
    description,
    keywords
  };
};

/**
 * Generate structured data for book collections
 * @param {Object} options - Structured data options
 * @returns {Object} - Structured data object
 */
export const generateBookCollectionStructuredData = (options = {}) => {
  const {
    title = '',
    description = '',
    url = '',
    books = [],
    totalResults = 0
  } = options;
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalResults,
      "itemListElement": books.slice(0, 10).map((book, index) => ({
        "@type": "Book",
        "position": index + 1,
        "name": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "publisher": book.publisher,
        "url": `https://boibabu.in/books/${book._id}`,
        "offers": {
          "@type": "Offer",
          "price": book.price,
          "priceCurrency": "INR",
          "availability": book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "BoiBabu"
          }
        }
      }))
    }
  };
};

/**
 * Generate structured data for individual books
 * @param {Object} book - Book object
 * @returns {Object} - Structured data object
 */
export const generateBookStructuredData = (book) => {
  if (!book) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "isbn": book.isbn,
    "publisher": {
      "@type": "Organization", 
      "name": book.publisher
    },
    "description": book.description,
    "image": book.images?.[0] ? `https://boibabu.in${book.images[0]}` : null,
    "url": `https://boibabu.in/books/${book._id}`,
    "offers": {
      "@type": "Offer",
      "price": book.price,
      "priceCurrency": "INR",
      "availability": book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "BoiBabu"
      }
    },
    "aggregateRating": book.averageRating ? {
      "@type": "AggregateRating",
      "ratingValue": book.averageRating,
      "reviewCount": book.reviewCount || 0
    } : undefined
  };
};

/**
 * Remove trailing slashes and normalize path
 * @param {string} path - URL path
 * @returns {string} - Normalized path
 */
export const normalizePath = (path) => {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
};

/**
 * Generate Open Graph and Twitter meta tags
 * @param {Object} options - Meta tag options
 * @returns {Object} - Meta tag object
 */
export const generateSocialMetaTags = (options = {}) => {
  const {
    title = '',
    description = '',
    url = '',
    image = 'https://boibabu.in/og-image.jpg',
    type = 'website'
  } = options;
  
  return {
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:type': type,
    'og:image': image,
    'og:site_name': 'BoiBabu',
    'og:locale': 'en_IN',
    
    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:site': '@BoiBabu'
  };
};