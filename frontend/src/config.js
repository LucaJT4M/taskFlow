// Adresse des Backends.
// Lokal: http://localhost:8000 – online wird VITE_API_URL gesetzt (z. B. in Vercel).
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')
