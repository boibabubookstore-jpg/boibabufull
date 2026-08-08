/**
 * Redirect utility functions for SEO-friendly URL handling
 */

/**
 * Check if current URL needs a redirect
 * @param {string} currentUrl - Current URL
 * @returns {string|null} - Redirect URL or null if no redirect needed
 */
export const checkForRedirect = (currentUrl) => {
  const url = new URL(currentUrl, 'https://boibabu.in');
  const pathname = url.pathname;
  const search = url.search;
  
  // Remove trailing slash (except for root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1) + search;
  }
  
  // Legacy URL redirects
  const legacyRedirects = {
    '/book/': '/books/',
    '/category/': '/books?category=',
    '/search/': '/books?search=',
    '/product/': '/books/',
    '/item/': '/books/'
  };
  
  for (const [oldPath, newPath] of Object.entries(legacyRedirects)) {
    if (pathname.startsWith(oldPath)) {
      const remainder = pathname.substring(oldPath.length);
      if (newPath.includes('?')) {
        return newPath + encodeURIComponent(remainder) + (search ? '&' + search.substring(1) : '');
      } else {
        return newPath + remainder + search;
      }
    }
  }
  
  // Case-insensitive redirects
  const caseRedirects = {
    '/Books': '/books',
    '/BOOKS': '/books',
    '/Login': '/login',
    '/LOGIN': '/login',
    '/Register': '/register',
    '/REGISTER': '/register',
    '/Cart': '/cart',
    '/CART': '/cart'
  };
  
  if (caseRedirects[pathname]) {
    return caseRedirects[pathname] + search;
  }
  
  return null;
};

/**
 * Generate proper canonical URL without redirects
 * @param {string} currentUrl - Current URL
 * @returns {string} - Canonical URL
 */
export const getCanonicalUrl = (currentUrl) => {
  const redirectUrl = checkForRedirect(currentUrl);
  if (redirectUrl) {
    return 'https://boibabu.in' + redirectUrl;
  }
  return currentUrl;
};

/**
 * Common redirect patterns for .htaccess testing
 */
export const redirectTestCases = [
  // HTTP to HTTPS
  { from: 'http://boibabu.in/', to: 'https://boibabu.in/' },
  { from: 'http://boibabu.in/books', to: 'https://boibabu.in/books' },
  
  // WWW to non-WWW
  { from: 'https://www.boibabu.in/', to: 'https://boibabu.in/' },
  { from: 'https://www.boibabu.in/books', to: 'https://boibabu.in/books' },
  
  // Trailing slash removal
  { from: 'https://boibabu.in/books/', to: 'https://boibabu.in/books' },
  { from: 'https://boibabu.in/login/', to: 'https://boibabu.in/login' },
  
  // Legacy URL redirects
  { from: 'https://boibabu.in/book/123', to: 'https://boibabu.in/books/123' },
  { from: 'https://boibabu.in/category/Fiction', to: 'https://boibabu.in/books?category=Fiction' },
  
  // Case-insensitive redirects
  { from: 'https://boibabu.in/Books', to: 'https://boibabu.in/books' },
  { from: 'https://boibabu.in/LOGIN', to: 'https://boibabu.in/login' }
];

/**
 * Validate redirect chain to prevent loops
 * @param {string} startUrl - Starting URL
 * @param {number} maxRedirects - Maximum redirects allowed
 * @returns {Object} - Validation result
 */
export const validateRedirectChain = (startUrl, maxRedirects = 5) => {
  const visited = new Set();
  let currentUrl = startUrl;
  let redirectCount = 0;
  const chain = [startUrl];
  
  while (redirectCount < maxRedirects) {
    if (visited.has(currentUrl)) {
      return {
        valid: false,
        error: 'Redirect loop detected',
        chain,
        loopUrl: currentUrl
      };
    }
    
    visited.add(currentUrl);
    const redirectUrl = checkForRedirect(currentUrl);
    
    if (!redirectUrl) {
      return {
        valid: true,
        finalUrl: currentUrl,
        redirectCount,
        chain
      };
    }
    
    currentUrl = 'https://boibabu.in' + redirectUrl;
    chain.push(currentUrl);
    redirectCount++;
  }
  
  return {
    valid: false,
    error: 'Too many redirects',
    chain,
    redirectCount
  };
};