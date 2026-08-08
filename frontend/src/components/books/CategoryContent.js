import React from 'react';
import { Link } from 'react-router-dom';
import { getCategoryInfo } from '../../constants/categoryDescriptions';
import { BookOpenIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

/**
 * CategoryContent component to add unique content to category pages
 * @param {string} categoryName - Name of the category
 * @param {number} bookCount - Number of books in category
 */
const CategoryContent = ({ categoryName, bookCount = 0 }) => {
  if (!categoryName) return null;
  
  const categoryInfo = getCategoryInfo(categoryName);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {categoryInfo.title}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          {categoryInfo.description}
        </p>
      </div>
      
      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpenIcon className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{bookCount}</span>
          </div>
          <p className="text-sm text-gray-600">Books Available</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <UserIcon className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{categoryInfo.popularAuthors?.length || 0}+</span>
          </div>
          <p className="text-sm text-gray-600">Popular Authors</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TagIcon className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{categoryInfo.relatedCategories?.length || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Related Categories</p>
        </div>
      </div>
      
      {/* Detailed Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          About {categoryName} Books
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {categoryInfo.longDescription}
        </p>
      </div>
      
      {/* Popular Authors */}
      {categoryInfo.popularAuthors && categoryInfo.popularAuthors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Popular {categoryName} Authors
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.popularAuthors.map((author, index) => (
              <Link
                key={index}
                to={`/books?search=${encodeURIComponent(author)}`}
                className="inline-block bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm hover:bg-primary-100 transition-colors"
              >
                {author}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Related Categories */}
      {categoryInfo.relatedCategories && categoryInfo.relatedCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Related Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.relatedCategories.map((relatedCategory, index) => (
              <Link
                key={index}
                to={`/books?category=${encodeURIComponent(relatedCategory)}`}
                className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {relatedCategory}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryContent;