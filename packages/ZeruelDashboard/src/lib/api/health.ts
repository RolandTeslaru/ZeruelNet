import axios from "axios";

export const scraperApi = axios.create({
    baseURL: "http://localhost:5003",
    timeout: 10000,
})