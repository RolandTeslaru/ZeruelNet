import { TableSchemaResponse } from '@/types/queries';
import React, { createContext, useContext, useState, useMemo, memo } from 'react';
import { z } from "zod"

const llm_identified_subject = z.object({
    stance: z.number().min(-1).max(1),
    subject: z.string()
})

export const EnrichedVideoSchema = z.object({
    video_id: z.string(),
    transcript: z.string(),
    detected_language: z.string(),
    last_enriched_at: z.iso.datetime(),
    
    llm_summary: z.string(),
    llm_identified_subjects: z.array(llm_identified_subject),
    llm_model_name: z.string(),
    llm_overall_alignment: z.number().min(-1).max(1),
    deterministic_alignment: z.number().min(-1).max(1),
    final_alignment: z.number().min(-1).max(1),
    alignment_conflict: z.number().min(-1).max(2),


    text_sentiment_positive: z.number().min(-1).max(1),
    text_sentiment_negative: z.number().min(-1).max(1),
    text_sentiment_neutral: z.number().min(-1).max(1),
    polarity: z.number().min(-1).max(1),

    enrichment_status: z.string(),
    total_count: z.string()
}) 

type EnrichedVideo = z.infer<typeof EnrichedVideoSchema>


interface EnrichmentViewerContextState {
    selectedVideoId: string | undefined;
    setSelectedVideoId: React.Dispatch<React.SetStateAction<string | undefined>>;

    selectedVideoData: EnrichedVideo | undefined;
    setSelectedVideoData: React.Dispatch<React.SetStateAction<EnrichedVideo | undefined>>;

    rowSelection: Record<string, boolean>;
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    queryParams: Record<string, any> | undefined;
    setQueryParams: React.Dispatch<React.SetStateAction<Record<string, any> | undefined>>;
}


const EnrichmentViewerContext = createContext<EnrichmentViewerContextState | undefined>(undefined)

export const EnrichmentViewerProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [selectedVideoId, setSelectedVideoId] = useState<string>();
    const [selectedVideoData, setSelectedVideoData] = useState<EnrichedVideo>();
    const [queryParams, setQueryParams] = useState<Record<string, any> | undefined>();

    const value = useMemo(() => ({
        selectedVideoId,
        setSelectedVideoId,
        selectedVideoData,
        setSelectedVideoData,
        rowSelection,
        setRowSelection,
        queryParams,
        setQueryParams,
    }), [selectedVideoId, selectedVideoData, rowSelection, queryParams])

    return (
        <EnrichmentViewerContext.Provider value={value}>
            {children}
        </EnrichmentViewerContext.Provider>
    )
})

export const useEnrichmentViewer = () => {
    const context = useContext(EnrichmentViewerContext)
    if (context === undefined) {
        throw new Error('useTablesContext must be used within a TablesProvider');
    }
    return context;
}