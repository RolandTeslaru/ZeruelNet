import React, { createContext, useContext, useState, useMemo, memo } from 'react';

interface EnrichmentViewerContextState {
    selectedVideoId: string | undefined
    setSelectedVideoId: React.Dispatch<React.SetStateAction<string | undefined>>
    // Stores the last submitted query parameters for the selected table
    queryParams: Record<string, any> | undefined;
    setQueryParams: React.Dispatch<React.SetStateAction<Record<string, any> | undefined>>;
}


const EnrichmentViewerContext = createContext<EnrichmentViewerContextState | undefined>(undefined)

export const EnrichmentViewerProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string>();
    const [queryParams, setQueryParams] = useState<Record<string, any> | undefined>(undefined);

    const value = useMemo(() => ({
        selectedVideoId,
        setSelectedVideoId,
        queryParams,
        setQueryParams
    }), [selectedVideoId, queryParams])

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