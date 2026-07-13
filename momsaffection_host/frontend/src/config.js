// frontend/src/config.js

// Production fallback is http://localhost:8000 if not specified in VITE_API_BASE_URL env var
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
