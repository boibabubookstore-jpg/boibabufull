import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ slides = [] }) => {
  // ALL HOOKS MUST BE AT THE VERY TOP - NO VARIABLES OR LOGIC BEFORE HOOKS
  const [currentSlide, setCurrentSlide] = useState(0);

  // Memoize valid slides to prevent unnecessary re-renders
  const validSlides = useMemo(() => {
    return Array.isArray(slides) ? slides.filter(slide => 
      slide && 
      slide.backgroundImage && 
      slide.title
    ) : [];
  }, [slides]);

  // Reset current slide if it's out of bounds - ALWAYS CALLED
  useEffect(() => {
    if (validSlides.length > 0 && currentSlide >= validSlides.length) {
      setCurrentSlide(0);
    }
  }, [validSlides.length, currentSlide]);

  // Auto-play functionality - ALWAYS CALLED
  useEffect(() => {
    // Early return inside useEffect is fine, but the hook itself must always be called
    if (validSlides.length <= 1) return;

    const safeCurrentSlide = Math.max(0, Math.min(currentSlide, validSlides.length - 1));
    const currentSlideData = validSlides[safeCurrentSlide];
    
    if (!currentSlideData) return;

    const delay = currentSlideData.autoSlideDelay || 5000;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validSlides.length);
    }, delay);

    return () => clearInterval(interval);
  }, [currentSlide, validSlides]);

  // Helper function to construct image URLs (now using Cloudinary)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Cloudinary URLs are returned directly from the backend
    if (imagePath.startsWith('http')) return imagePath;
    // Fallback for any legacy paths
    const baseURL = process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app';
    return `${baseURL}${imagePath}`;
  };

  // Calculate current slide data AFTER all hooks
  const safeCurrentSlide = Math.max(0, Math.min(currentSlide, validSlides.length - 1));
  const currentSlideData = validSlides[safeCurrentSlide];

  // Default hero section component
  const DefaultHeroSection = () => (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next
            <span className="block text-yellow-300">Great Read</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            India's largest online bookstore with thousands of books across all genres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/books"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Browse Books
            </Link>
            <Link
              to="/books?featured=true"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              Featured Books
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  // If no valid slides or current slide data, show default hero section
  if (validSlides.length === 0 || !currentSlideData) {
    return <DefaultHeroSection />;
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${getImageUrl(currentSlideData.backgroundImage)})`,
        }}
      >
        {/* Dark Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-40 transition-all duration-1000 ease-in-out"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in"
              style={{ color: currentSlideData.textColor || '#ffffff' }}
            >
              {currentSlideData.title}
            </h1>
            
            <p 
              className="text-xl md:text-2xl mb-4 animate-slide-up opacity-90"
              style={{ color: currentSlideData.textColor || '#ffffff' }}
            >
              {currentSlideData.subtitle}
            </p>

            {currentSlideData.description && (
              <p 
                className="text-lg mb-8 animate-slide-up opacity-80 max-w-2xl mx-auto"
                style={{ color: currentSlideData.textColor || '#ffffff' }}
              >
                {currentSlideData.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
              {/* Primary Button */}
              <Link
                to={currentSlideData.primaryButton?.link || '/books'}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                  currentSlideData.primaryButton?.style === 'primary'
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : currentSlideData.primaryButton?.style === 'secondary'
                    ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                    : 'border-2 border-white text-white hover:bg-white hover:text-primary-600'
                }`}
              >
                {currentSlideData.primaryButton?.text || 'Browse Books'}
              </Link>

              {/* Secondary Button */}
              <Link
                to={currentSlideData.secondaryButton?.link || '/books?featured=true'}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  currentSlideData.secondaryButton?.style === 'primary'
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : currentSlideData.secondaryButton?.style === 'secondary'
                    ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                    : 'border-2 border-white text-white hover:bg-white hover:text-primary-600'
                }`}
              >
                {currentSlideData.secondaryButton?.text || 'Featured Books'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;