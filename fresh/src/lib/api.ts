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

// Seamlessly unwrap paginated response envelopes for legacy list consumers while preserving .pagination and .data properties
axios.interceptors.response.use((response) => {
  if (
    response &&
    response.data &&
    typeof response.data === 'object' &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.data) &&
    response.data.pagination
  ) {
    const list = [...response.data.data];
    Object.assign(list, {
      data: response.data.data,
      items: response.data.data,
      pagination: response.data.pagination,
    });
    response.data = list;
  }
  return response;
});

// Also patch window.fetch so consumers using native fetch receive compatible array-like objects
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await originalFetch.apply(this, args);
    const originalJson = res.json;
    res.json = async function () {
      const data = await originalJson.apply(this);
      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        Array.isArray(data.data) &&
        data.pagination
      ) {
        const list = [...data.data];
        Object.assign(list, {
          data: data.data,
          items: data.data,
          pagination: data.pagination,
        });
        return list;
      }
      return data;
    };
    return res;
  };
}

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
