import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import { getPlaceholderImage } from '../../utils/imageUtils';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  BookOpenIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SellerBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1
  });

  const fetchBooks = useCallback(async () => {
    try {
      const response = await api.get('/api/seller/books', {
        params: filters
      });
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your approved books that are live on the website
          </p>
        </div>
        <Link
          to="/seller/books/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Book
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Books Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Book Image */}
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                    {book.images && book.images.length > 0 ? (
                      <img
                        src={book.images[0].startsWith('http') ? book.images[0] : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${book.images[0]}`}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <BookOpenIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(book.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {book.stock}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {typeof book.category === 'object' ? book.category.name : book.category}
                      </span>
                      {book.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {book.rating.average?.toFixed(1)} ({book.rating.count})
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {book.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/books/${book._id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/seller/books/edit/${book._id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search 
                  ? 'No books match your search criteria.'
                  : 'You haven\'t added any books yet. Submit your first book for approval!'
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/seller/books/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Book
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBooks;