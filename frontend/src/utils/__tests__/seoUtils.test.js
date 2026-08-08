/**
 * Tests for SEO utility functions
 * Run with: npm test seoUtils.test.js
 */

import { generateCanonicalUrl, generateSEOMetadata } from '../seoUtils';

describe('SEO Utils', () => {
  describe('generateCanonicalUrl', () => {
    test('should generate clean canonical URL with ordered parameters', () => {
      const searchParams = new URLSearchParams('sortBy=price&category=Fiction&featured=true&minPrice=&maxPrice=');
      const result = generateCanonicalUrl(searchParams, '/books');
      
      expect(result).toBe('https://boibabu.in/books?category=Fiction&sortBy=price&featured=true');
    });

    test('should handle empty parameters correctly', () => {
      const searchParams = new URLSearchParams('category=&search=javascript&sortBy=');
      const result = generateCanonicalUrl(searchParams, '/books');
      
      expect(result).toBe('https://boibabu.in/books?search=javascript');
    });

    test('should return base URL when no parameters', () => {
      const searchParams = new URLSearchParams('');
      const result = generateCanonicalUrl(searchParams, '/books');
      
      expect(result).toBe('https://boibabu.in/books');
    });

    test('should handle special characters in parameters', () => {
      const searchParams = new URLSearchParams('category=Sci-Fi&search=C++');
      const result = generateCanonicalUrl(searchParams, '/books');
      
      expect(result).toBe('https://boibabu.in/books?category=Sci-Fi&search=C%2B%2B');
    });
  });

  describe('generateSEOMetadata', () => {
    test('should generate metadata for category filter', () => {
      const filters = { category: 'Fiction' };
      const result = generateSEOMetadata({ filters });
      
      expect(result.title).toContain('Fiction Books');
      expect(result.description).toContain('Fiction books');
      expect(result.keywords).toContain('Fiction books');
    });

    test('should generate metadata for search query', () => {
      const filters = { search: 'JavaScript' };
      const result = generateSEOMetadata({ filters });
      
      expect(result.title).toContain('JavaScript Books');
      expect(result.description).toContain('JavaScript books');
      expect(result.keywords).toContain('JavaScript books');
    });

    test('should generate metadata for featured books', () => {
      const filters = { featured: 'true' };
      const result = generateSEOMetadata({ filters });
      
      expect(result.title).toContain('Featured Books');
      expect(result.description).toContain('featured books');
      expect(result.keywords).toContain('featured books');
    });

    test('should include total results in description', () => {
      const filters = { category: 'Fiction' };
      const result = generateSEOMetadata({ filters, totalResults: 150 });
      
      expect(result.description).toContain('Browse 150 books');
    });
  });
});

// Mock test data for manual testing
export const testCanonicalUrls = () => {
  console.log('Testing Canonical URL Generation:');
  
  const testCases = [
    'sortBy=price&category=Fiction&featured=true&minPrice=&maxPrice=',
    'category=Fiction&featured=true&sortBy=price',
    'featured=true&category=Fiction&sortBy=price&maxPrice=',
    'search=javascript&sortBy=createdAt&sortOrder=desc',
    'category=&search=&sortBy=&featured=true',
    ''
  ];
  
  testCases.forEach((params, index) => {
    const searchParams = new URLSearchParams(params);
    const canonical = generateCanonicalUrl(searchParams, '/books');
    console.log(`Test ${index + 1}: ${params} -> ${canonical}`);
  });
};