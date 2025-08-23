import axios from "axios";

// The API now lives inside the Next.js app itself, not on a separate port.
// During development, this is typically localhost:3000.
// On the client-side, a relative path is fine ('/'). 
// On the server-side, we need the full path to make a request to our own API.
const baseURL = typeof window === 'undefined' 
    ? `http://localhost:${process.env.PORT || 3000}` 
    : '/';

export const api = axios.create({
    baseURL,
    timeout: 10000,
})

api.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)