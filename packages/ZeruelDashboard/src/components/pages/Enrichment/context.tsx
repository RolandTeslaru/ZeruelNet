import { EnrichedVideo } from '@/types/enrichedVideo';
import React, { createContext, useContext, useState, useMemo, memo } from 'react';
import { z } from "zod"




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