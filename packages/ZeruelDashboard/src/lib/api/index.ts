import axios from "axios";

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