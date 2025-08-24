import { useSystem } from "@/stores/useSystem";
import axios from "axios";

export const scraperApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SCRAPER_SERVICE_URL,
    timeout: 10000,
})

scraperApi.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)

export async function sendScrapeCommand(urlPath: string, params: any){
    try {
        const { data } = await scraperApi.post(urlPath, params)
        return data
    } catch (error) {
        const errorDetails = handleScraperError(error);
        
        useSystem.getState().setOverrideStage({
            type: "FAILURE",
            title: errorDetails.code === 'ERR_NETWORK' 
                ? "ERROR:  SCRAPER  SERVICE  UNREACHABLE"
                : "ERROR:  FAILED  TO SEND  CMD"
        })

        setTimeout(() => {
            useSystem.getState().setOverrideStage(null)
        },4000)
    }
}


export function handleScraperError(error: any){
    if(axios.isAxiosError(error)){
        const errorDetails = {
            code: error.code,
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL
        }

        console.group('SCRAPER API ERROR');
        console.error('Error Code:', errorDetails.code);
        console.error('Message:', errorDetails.message);
        console.error('Target URL:', `${errorDetails.baseURL}${errorDetails.url}`);
        
        if (error.code === 'ERR_NETWORK') {
            console.error("Scraper Service is not running or unreachable")
        } else if (error.response) {
            console.error('Status:', errorDetails.status);
            console.error('Response:', error.response.data);
        }
        console.groupEnd();
        
        return errorDetails;
    }

    console.error('NON-AXIOS ERROR:', error);
    return { code: 'UNKNOWN', message: error?.message || 'Unknown error' };
}