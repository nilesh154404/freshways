import axios from 'axios';

// Automatically attach JWT token to all outbound Axios requests if present in localStorage
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized API configuration
// Uses environment variable for the API base URL

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3064/api';
// export const API_BASE_URL = 'https://freshwayz.dexpertsystems.com';
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://freshwayz.dexpertsystems.com';


// Helper to construct full API URLs
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Normalizes image and upload URLs to ensure admin.freshwayz.dexpertsystems.com domain is used
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  return url
    .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
};

// For file/media URLs
export const fileUrl = (path: string): string => {
  if (!path) return '';
  const normalized = normalizeImageUrl(path);
  // If path already has the base URL, return as is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  // Ensure path starts with /
  const normalizedPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
