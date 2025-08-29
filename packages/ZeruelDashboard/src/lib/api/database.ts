import { DatabaseAPI } from "@/types/api/database";
import { api } from ".";


export async function fetchVideos(
    
    params: DatabaseAPI.Videos.Query

): Promise<DatabaseAPI.Videos.Response>{
    const { data } = await api.get("/api/v1/database/videos", { params })
    return data;
}



export async function fetchVideoFeatures(

    params: DatabaseAPI.VideoFeatures.Query

): Promise<DatabaseAPI.VideoFeatures.Response>{
    const { data } = await api.get("/api/v1/database/video_features", { params })
    return data;
}



export async function fetchAllVideoIds(): Promise<string[]> {
    const { data } = await api.get("/api/v1/database/videos/ids");
    return data;
}



export async function fetchComments(

    params: DatabaseAPI.Comments.Query

): Promise<DatabaseAPI.Comments.Response>{
    const { data } = await api.get("/api/v1/database/comments", { params })
    return data
}




export async function fetchKnowledgeSubjects(

    params: DatabaseAPI.KnowledgeSubjects.Query

): Promise<DatabaseAPI.KnowledgeSubjects.Response> {
    const { data } = await api.get("/api/v1/database/knowledge_subjects")
    return data
}





export async function fetchTableMeta(
    
    params: DatabaseAPI.TableMeta.Query

): Promise<DatabaseAPI.TableMeta.Response>{
    const { tableName } = params;
    const { data } = await api.get(`/api/v1/database/meta/${tableName}/schema`);
    return data;
}



export async function fetchTableColumns(

    tableName: string

): Promise<DatabaseAPI.TableMeta.Column[]> {
    const { data } = await api.get(`/api/v1/database/meta/${tableName}/columns`);
    return data;
}



export async function fetchTableConstraints(
    
    tableName: string

): Promise<DatabaseAPI.TableMeta.Constraint[]> {
    const { data } = await api.get(`/api/v1/database/meta/${tableName}/constraints`);
    return data;
}



export async function fetchTableIndexes(
    
    tableName: string

): Promise<DatabaseAPI.TableMeta.Index[]> {
    const { data } = await api.get(`/api/v1/database/meta/${tableName}/indexes`);
    return data;
}



export async function fetchTableTriggers(
    
    tableName: string

): Promise<DatabaseAPI.TableMeta.Trigger[]> {
    const { data } = await api.get(`/api/v1/database/meta/${tableName}/triggers`);
    return data;
}



export async function fetchDatabaseHealth(): Promise<any> {
    const {data} = await api.get(`/health/database`)
    return data
}




