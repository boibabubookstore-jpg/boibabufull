import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRightIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  BanknotesIcon,
  BookOpenIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import BookCard from '../components/books/BookCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroCarousel from '../components/ui/HeroCarousel';

const HomePage = () => {
  // Helper function to construct image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app${imagePath}`;
  };
  // Fetch website settings
  const { data: websiteSettings } = useQuery(
    'websiteSettings',
    () => {
      return api.get('/api/admin/website-settings/public').then(res => res.data);
    },
    { 
      staleTime: 30 * 60 * 1000, // Cache for 30 minutes
      retry: 1,
      onSuccess: (data) => {
        console.log('Website settings loaded:', data);
      },
      onError: (error) => {
        console.error('Failed to load website settings:', error);
      }
    }
  );

  // Fetch active hero slides
  const { data: heroSlides, isLoading: heroSlidesLoading } = useQuery(
    'heroSlides',
    () => {
      return api.get('/api/admin/hero-slides/active').then(res => res.data);
    },
    { 
      staleTime: 10 * 60 * 1000,
      onSuccess: (data) => {
        console.log('Hero slides loaded:', data);
      },
      onError: (error) => {
        console.error('Failed to load hero slides:', error);
      }
    }
  );
  const { data: publisherAds, isLoading: publisherAdsLoading, error: publisherAdsError } = useQuery(
    'publisherAds',
    () => {
      return api.get('/api/admin/publisher-ads/active').then(res => res.data);
    },
    { 
      staleTime: 10 * 60 * 1000,
      onSuccess: (data) => {
        console.log('Publisher ads loaded:', data);
      },
      onError: (error) => {
        console.error('Failed to load publisher ads:', error);
      }
    }
  );
  // Fetch featured books
  const { data: featuredBooks, isLoading: featuredLoading } = useQuery(
    'featuredBooks',
    () => {
      return api.get('/api/books/featured/list').then(res => res.data);
    },
    { staleTime: 10 * 60 * 1000 }
  );

  // Fetch bestsellers
  const { data: bestsellers, isLoading: bestsellersLoading } = useQuery(
    'bestsellers',
    () => {
      return api.get('/api/books/bestsellers/list').then(res => res.data);
    },
    { staleTime: 10 * 60 * 1000 }
  );

  // Fetch new arrivals
  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery(
    'newArrivals',
    () => {
      return api.get('/api/books/new-arrivals/list').then(res => res.data);
    },
    { staleTime: 10 * 60 * 1000 }
  );

  // Fetch books by category for category section
  const { data: categoryBooks } = useQuery(
    'categoryBooks',
    () => {
      return api.get('/api/books?limit=20').then(res => res.data);
    },
    { staleTime: 10 * 60 * 1000 }
  );

  // Get unique publishers from books (fallback if no publisher ads)
  const publishers = React.useMemo(() => {
    console.log('Processing publishers:', { publisherAds, categoryBooks });
    
    if (publisherAds && publisherAds.length > 0) {
      console.log('Using publisher ads:', publisherAds);
      return publisherAds;
    }
    
    // Fallback to books publishers
    if (!categoryBooks?.books) return [];
    const publisherSet = new Set();
    categoryBooks.books.forEach(book => {
      if (book.publisher) {
        publisherSet.add(book.publisher);
      }
    });
    const fallbackPublishers = Array.from(publisherSet).slice(0, 8).map(name => ({
      name,
      description: 'Quality Books',
      image: null
    }));
    console.log('Using fallback publishers:', fallbackPublishers);
    return fallbackPublishers;
  }, [categoryBooks, publisherAds]);

  const categories = [
    { name: 'Fiction', icon: '📚', description: 'Novels, stories, and literary fiction' },
    { name: 'Non-Fiction', icon: '📖', description: 'Real stories, biographies, and factual books' },
    { name: 'Mystery', icon: '🔍', description: 'Thrillers, detective stories, and suspense' },
    { name: 'Romance', icon: '💕', description: 'Love stories and romantic novels' },
    { name: 'Sci-Fi', icon: '🚀', description: 'Science fiction and futuristic tales' },
    { name: 'Fantasy', icon: '🧙‍♂️', description: 'Magic, dragons, and fantasy worlds' },
    { name: 'Biography', icon: '👤', description: 'Life stories of famous personalities' },
    { name: 'Self-Help', icon: '💪', description: 'Personal development and motivation' },
    { name: 'Technology', icon: '💻', description: 'Programming, tech, and digital innovation' },
    { name: 'Business', icon: '💼', description: 'Entrepreneurship, management, and finance' },
    { name: 'Education', icon: '🎓', description: 'Academic books and learning resources' },
    { name: 'Children', icon: '🧸', description: 'Kids books, stories, and educational content' }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BookStore",
    "name": websiteSettings?.websiteName || "BoiBabu",
    "url": `https://${websiteSettings?.websiteDomain || 'boibabu.in'}`,
    "description": websiteSettings?.metaDescription || "India's premier online bookstore offering thousands of books across all genres with best prices, free shipping, and fast delivery.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "offers": {
      "@type": "Offer",
      "description": `Free shipping on orders over ₹${websiteSettings?.features?.freeShippingThreshold || 2000}`,
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "0",
        "priceCurrency": "INR"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{websiteSettings?.websiteName || 'BoiBabu'} - India's Premier Online Bookstore | Buy Books Online at Best Prices</title>
        <meta name="description" content={websiteSettings?.metaDescription || "BoiBabu.in - India's largest online bookstore. Buy books online with free shipping, best prices, and fast delivery. Fiction, Non-fiction, Academic books, and more. Shop now!"} />
        <meta name="keywords" content={websiteSettings?.metaKeywords || "buy books online, online bookstore India, books online, BoiBabu, fiction books, non-fiction books, academic books, bestsellers, new arrivals, book shopping, free shipping books, discount books, Indian bookstore"} />
        <link rel="canonical" href={`https://${websiteSettings?.websiteDomain || 'boibabu.in'}/`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        {heroSlidesLoading ? (
          <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="animate-pulse">
                  <div className="h-12 bg-white bg-opacity-20 rounded mb-6"></div>
                  <div className="h-6 bg-white bg-opacity-20 rounded mb-8"></div>
                  <div className="flex justify-center space-x-4">
                    <div className="h-12 w-32 bg-white bg-opacity-20 rounded"></div>
                    <div className="h-12 w-32 bg-white bg-opacity-20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <HeroCarousel slides={heroSlides} />
        )}

        {/* Features Section */}
        <section className="py-16 bg-gray-50" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <h2 id="features-heading" className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Choose BoiBabu?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over ₹{websiteSettings?.features?.freeShippingThreshold || 2000}. Fast and reliable delivery to your doorstep across India.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                <p className="text-gray-600">Your payment information is secure with our encrypted checkout process and trusted payment gateways.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600">Competitive prices on all books with regular discounts, special offers, and exclusive deals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Find Books by Category Section - Side Scrolling */}
        <section className="py-16" aria-labelledby="categories-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="categories-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Find Your Book by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our vast collection of books organized by genres. From fiction to academic books, find exactly what you're looking for.
              </p>
            </div>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative">
              <div 
                className="category-scroll flex overflow-x-auto gap-4 md:gap-6 pb-4 px-2 scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={`/books?category=${encodeURIComponent(category.name)}`}
                    className="category-card group bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-primary-300 flex-shrink-0 w-40 md:w-48 p-4 md:p-6 text-center"
                    aria-label={`Browse ${category.name} books - ${category.description}`}
                  >
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 group-hover:text-gray-700 line-clamp-2">
                      {category.description}
                    </p>
                  </Link>
                ))}
              </div>
              
              {/* Mobile scroll hint */}
              <div className="text-center mt-4 md:hidden">
                <p className="text-sm text-gray-500">← Scroll to see more categories →</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link
                to="/books"
                className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                aria-label="View all book categories"
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                View All Categories
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="py-16" aria-labelledby="featured-heading">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 id="featured-heading" className="text-3xl font-bold text-gray-900">Featured Books</h2>
              <Link
                to="/books?featured=true"
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                aria-label="View all featured books"
              >
                View All
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {featuredLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredBooks?.slice(0, 4).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-16 bg-gray-50" aria-labelledby="bestsellers-heading">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 id="bestsellers-heading" className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              <Link
                to="/books?bestseller=true"
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                aria-label="View all bestseller books"
              >
                View All
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {bestsellersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestsellers?.slice(0, 4).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16" aria-labelledby="new-arrivals-heading">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 id="new-arrivals-heading" className="text-3xl font-bold text-gray-900">New Arrivals</h2>
              <Link
                to="/books?newArrival=true"
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                aria-label="View all new arrival books"
              >
                View All
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {newArrivalsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals?.slice(0, 4).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Publishers Advertisement Banner */}
        <section className="py-12 bg-gradient-to-r from-gray-100 to-gray-200" aria-labelledby="publishers-ad-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 id="publishers-ad-heading" className="text-2xl font-bold text-gray-900 mb-2">
                Trusted Publishers & Brands
              </h2>
              <p className="text-gray-600">
                Quality books from renowned publishing houses worldwide
              </p>
            </div>
            
            {publisherAdsLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">Loading publishers...</span>
              </div>
            ) : publisherAdsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load publishers: {publisherAdsError.message}</p>
              </div>
            ) : publishers.length > 0 ? (
              <div className="publisher-banner">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {publishers.length} publisher{publishers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {/* Scrolling Publisher Logos */}
                <div className="flex overflow-hidden">
                  <div className="publisher-scroll-container">
                    {/* First set of publishers */}
                    {publishers.map((publisher, index) => (
                      <div
                        key={`first-${publisher.name || publisher}-${index}`}
                        className="publisher-card bg-white rounded-lg shadow-sm p-6 text-center border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {publisher.image ? (
                          <img
                            src={getImageUrl(publisher.image)}
                            alt={publisher.name}
                            className="w-12 h-12 mx-auto mb-3 object-contain rounded"
                            onError={(e) => {
                              console.error('Failed to load publisher image:', publisher.image);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" 
                          style={{ display: publisher.image ? 'none' : 'flex' }}
                        >
                          <BuildingLibraryIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {publisher.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{publisher.description}</p>
                      </div>
                    ))}
                    {/* Duplicate set for seamless scrolling */}
                    {publishers.map((publisher, index) => (
                      <div
                        key={`second-${publisher.name || publisher}-${index}`}
                        className="publisher-card bg-white rounded-lg shadow-sm p-6 text-center border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {publisher.image ? (
                          <img
                            src={getImageUrl(publisher.image)}
                            alt={publisher.name}
                            className="w-12 h-12 mx-auto mb-3 object-contain rounded"
                            onError={(e) => {
                              console.error('Failed to load publisher image:', publisher.image);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" 
                          style={{ display: publisher.image ? 'none' : 'flex' }}
                        >
                          <BuildingLibraryIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {publisher.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{publisher.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center space-x-8 opacity-60">
                  {/* Placeholder publisher logos */}
                  {['Penguin', 'HarperCollins', 'Scholastic', 'McGraw Hill', 'Oxford', 'Cambridge'].map((name) => (
                    <div key={name} className="bg-white rounded-lg shadow-sm p-4 min-w-[150px] text-center border border-gray-200">
                      <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-600">{name}</h3>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 mt-4 text-sm">
                  Publishers will be displayed here as advertisements are added by admin
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary-600" aria-labelledby="newsletter-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center text-white">
              <h2 id="newsletter-heading" className="text-3xl font-bold mb-4">Stay Updated with {websiteSettings?.websiteName || 'BoiBabu'}</h2>
              <p className="text-xl mb-8 text-blue-100">
                Subscribe to our newsletter and be the first to know about new arrivals, special offers, bestsellers, and personalized book recommendations.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" aria-label="Newsletter subscription form">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;