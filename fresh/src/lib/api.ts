// Centralized API configuration
// Uses environment variable for the API base URL

// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3064';
// export const API_BASE_URL = 'https://freshwayz.dexpertsystems.com';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://freshwayz.dexpertsystems.com';


// Helper to construct full API URLs
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// For file/media URLs
export const fileUrl = (path: string): string => {
  if (!path) return '';
  // If path already has the base URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
