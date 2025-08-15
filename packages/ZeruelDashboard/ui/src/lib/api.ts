import axios from "axios";
import { 
    CommentQueryParams, CommentsResponse, 
    TableSchemaQueryParams, TableSchemaResponse, 
    type VideosQueryParams, type VideosResponse,
    type VideoFeaturesQueryParams, type VideoFeaturesResponse,
    Constraint, Index, Trigger
} from "@zeruel/dashboard-types";

export const api = axios.create({
    baseURL: "http://localhost:5003",
    timeout: 10000,
})

api.interceptors.request.use(
    r => r,
    err => Promise.reject(new Error(err?.response?.data?.error ?? err.message))
)

export async function fetchVideos(params: VideosQueryParams): Promise<VideosResponse>{
    const { data } = await api.get("/api/v1/videos", { params })
    return data;
}

export async function fetchVideoFeatures(params: VideoFeaturesQueryParams): Promise<VideoFeaturesResponse>{
    const { data } = await api.get("/api/v1/video_features", { params })
    return data;
}

export async function fetchComments(params: CommentQueryParams): Promise<CommentsResponse>{
    const { data } = await api.get("/api/v1/comments", { params })
    return data
}

export async function fetchTableSchema(params: TableSchemaQueryParams): Promise<TableSchemaResponse>{
    const { tableName } = params;
    const { data } = await api.get(`/api/v1/tables/${tableName}/schema`);
    return data;
}

export async function fetchTableColumns(tableName: string): Promise<TableSchemaResponse> {
    const { data } = await api.get(`/api/v1/tables/${tableName}/columns`);
    return data;
}

export async function fetchTableConstraints(tableName: string): Promise<Constraint[]> {
    const { data } = await api.get(`/api/v1/tables/${tableName}/constraints`);
    return data;
}

export async function fetchTableIndexes(tableName: string): Promise<Index[]> {
    const { data } = await api.get(`/api/v1/tables/${tableName}/indexes`);
    return data;
}

export async function fetchTableTriggers(tableName: string): Promise<Trigger[]> {
    const { data } = await api.get(`/api/v1/tables/${tableName}/triggers`);
    return data;
}
