import {z} from "zod"
import { api } from ".";
import { TrendsAPI } from "@/types/api";


export async function fetchDataBounds(): Promise<TrendsAPI.Metadata.DataBounds.Response>{
    const { data } = await api.get("/api/v1/trends/metadata/data-bounds")
    return data;
}


export async function fetchSujects(
    
    params: TrendsAPI.Subjects.Query

): Promise<TrendsAPI.Subjects.Response>{
    const { data } = await api.get("/api/v1/trends/subjects", { params })
    return data;
}


export async function fetchComposedData(

    params: TrendsAPI.ComposedData.Query

): Promise<TrendsAPI.ComposedData.Response>{
    const { data } = await api.get("/api/v1/trends/composed-data", {params})
    return data
}