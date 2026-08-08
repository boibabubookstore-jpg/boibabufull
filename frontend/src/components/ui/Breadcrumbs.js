import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Breadcrumbs component for navigation and SEO
 * @param {Array} items - Array of breadcrumb items
 */
const Breadcrumbs = ({ items = [] }) => {
  const allItems = [
    { label: 'Home', href: '/', icon: HomeIcon },
    ...items
  ];

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://boibabu.in${item.href}` : undefined
    }))
  };

  return (
    <>
      {/* Structured data for breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const Icon = item.icon;
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                )}
                
                {isLast ? (
                  <span className="font-medium text-gray-900 flex items-center">
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="hover:text-primary-600 transition-colors flex items-center"
                  >
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;