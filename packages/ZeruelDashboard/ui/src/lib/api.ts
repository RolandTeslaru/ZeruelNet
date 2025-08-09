import axios from "axios";
import { type VideoQueryParams, type VideosResponse } from "@zeruel/dashboard-types";

export const api = axios.create({
    baseURL: "http://localhost:5003",
    timeout: 10000,
})

api.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)

export async function fetchVideos(params: VideoQueryParams): Promise<VideosResponse>{
    const { data } = await api.get("/api/v1/videos", { params })
    return data;
}