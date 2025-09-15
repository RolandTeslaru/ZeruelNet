import { DatabaseAPI } from "@/types/api/database";
import { api } from ".";
import { EnrichmentAPI } from "@/types/api/enrichment";


export async function fetchRemoveDeleted(
): Promise<EnrichmentAPI.RemoveDeleted.Response>{
    const { data } = await api.get("/api/v1/enrichment/removeDeleted")
    return data;
}

export async function fetchRunOnFailed(

): Promise<EnrichmentAPI.RunOnFailed.Response>{
    const {data} = await api.get("/api/v1/enrichment/runOnFailed")
    return data;
}

export async function fetchRunEnrich(
    params: EnrichmentAPI.Enrich.Query
): Promise<EnrichmentAPI.Enrich.Response>{
    const {data} = await api.get("/api/v1/enrichment/enrichVideo", {params})
    return data;
}

export async function fetchRemoveVideo(
    params: EnrichmentAPI.RemoveVideo.Query
): Promise<EnrichmentAPI.RemoveVideo.Response>{
    const {data} = await api.get("/api/v1/enrichment/removeVideo", {params})
    return data;
}