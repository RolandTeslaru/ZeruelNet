import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:5003",
    timeout: 10000,
})

api.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)