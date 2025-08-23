import { useSystem } from "@/stores/useSystem";
import axios from "axios";

export const SCRAPER_PORT = process.env.NEXT_PUBLIC_SCRAPER_SERVICE_PORT

export const scraperApi = axios.create({
    baseURL: `http://localhost:${SCRAPER_PORT}`,
    timeout: 10000,
})

scraperApi.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)

export async function sendScrapeCommand(urlPath: string, params: any){
    try {
        const { data } = await scraperApi.get(urlPath, { params})
        return data
    } catch (error) {
        useSystem.getState().setOverrideStage({
            type: "FAILURE",
            title: "ERROR:  FAILED  TO  SEND  CMD"
        })

        setTimeout(() => {
            useSystem.getState().setOverrideStage(null)
        },3000)
    }
}