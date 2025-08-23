import axios from "axios";

const PORT = process.env.NEXT_PUBLIC_ZERUEL_DASHBOARD_SERVICE_PORT;

export const api = axios.create({
    baseURL: `http://localhost:${PORT}`,
    timeout: 10000,
})

api.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)