// Image utility functions for BoiBabu with Cloudinary integration

// Helper function to construct image URLs (now using Cloudinary)
export const getImageUrl = (imagePath, options = {}) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (Cloudinary or external), return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // For Cloudinary URLs, we'll get them directly from the backend
  // This is a fallback for any legacy local paths
  const baseURL = process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app';
  return `${baseURL}${imagePath}`;
};

// Helper function specifically for Cloudinary URLs
export const getCloudinaryUrl = (imagePath, transformations = {}) => {
  if (!imagePath) return null;
  
  // If it's already a full Cloudinary URL, return as is
  if (imagePath.startsWith('http') && imagePath.includes('cloudinary.com')) {
    return imagePath;
  }
  
  // If it's a Cloudinary public ID, construct the URL
  if (imagePath.includes('boibabu/')) {
    const cloudName = 'your-cloud-name'; // This should come from env
    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    
    // Add transformations if provided
    if (Object.keys(transformations).length > 0) {
      const transformString = Object.entries(transformations)
        .map(([key, value]) => `${key}_${value}`)
        .join(',');
      url += `${transformString}/`;
    }
    
    url += imagePath;
    return url;
  }
  
  // Fallback to regular getImageUrl for legacy paths
  return getImageUrl(imagePath);
};

// Get optimized image URL with specific transformations
export const getOptimizedImage = (imagePath, width, height, quality = 'auto:good') => {
  // For Cloudinary images, use transformations
  if (imagePath && imagePath.includes('cloudinary.com')) {
    return imagePath; // Cloudinary URLs already optimized
  }
  
  // For Cloudinary public IDs, apply transformations
  if (imagePath && imagePath.includes('boibabu/')) {
    return getCloudinaryUrl(imagePath, {
      w: width,
      h: height,
      q: quality,
      c: 'fill'
    });
  }
  
  // Fallback for legacy images
  return getImageUrl(imagePath);
};

// Get thumbnail image
export const getThumbnailImage = (imagePath, size = 150) => {
  return getOptimizedImage(imagePath, size, size);
};

// Get responsive image URLs for different screen sizes
export const getResponsiveImages = (imagePath) => {
  if (!imagePath) return {};
  
  return {
    thumbnail: getThumbnailImage(imagePath, 150),
    small: getOptimizedImage(imagePath, 300, 400),
    medium: getOptimizedImage(imagePath, 600, 800),
    large: getOptimizedImage(imagePath, 1200, 1600),
    original: getImageUrl(imagePath)
  };
};

// Default placeholder image
export const getPlaceholderImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
};

// Get book image with fallback
export const getBookImageUrl = (book, index = 0) => {
  if (!book || !book.images || !book.images[index]) {
    return getPlaceholderImage();
  }
  
  const image = book.images[index];
  if (image.startsWith('http')) {
    return image; // Already a full URL (Cloudinary or external)
  }
  
  // Construct full URL for relative paths
  const baseURL = process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app';
  return `${baseURL}${image}`;
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
  
  return true;
};

// Extract filename from path
export const getFileName = (imagePath) => {
  if (!imagePath) return '';
  return imagePath.split('/').pop().split('.')[0];
};

// Check if image exists (for error handling)
export const checkImageExists = async (imagePath) => {
  try {
    const response = await fetch(getImageUrl(imagePath), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

const imageUtils = {
  getImageUrl,
  getCloudinaryUrl,
  getOptimizedImage,
  getThumbnailImage,
  getResponsiveImages,
  getPlaceholderImage,
  getBookImageUrl,
  validateImageFile,
  getFileName,
  checkImageExists
};

export default imageUtils;