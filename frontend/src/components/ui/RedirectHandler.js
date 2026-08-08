import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * RedirectHandler component to handle client-side redirects
 * This ensures proper SEO-friendly redirects without redirect loops
 */
const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // Handle trailing slash redirects
    if (currentPath.length > 1 && currentPath.endsWith('/')) {
      const newPath = currentPath.slice(0, -1);
      navigate(newPath + currentSearch, { replace: true });
      return;
    }

    // Handle legacy URL redirects
    const legacyRedirects = {
      '/book/': '/books/',
      '/category/': '/books?category=',
      '/search/': '/books?search=',
      '/product/': '/books/',
      '/item/': '/books/'
    };

    for (const [oldPath, newPath] of Object.entries(legacyRedirects)) {
      if (currentPath.startsWith(oldPath)) {
        const remainder = currentPath.substring(oldPath.length);
        let redirectTo;
        
        if (newPath.includes('?')) {
          redirectTo = newPath + encodeURIComponent(remainder);
        } else {
          redirectTo = newPath + remainder;
        }
        
        navigate(redirectTo + currentSearch, { replace: true });
        return;
      }
    }

    // Handle case-insensitive redirects for common paths
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

    if (caseRedirects[currentPath]) {
      navigate(caseRedirects[currentPath] + currentSearch, { replace: true });
      return;
    }

  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;