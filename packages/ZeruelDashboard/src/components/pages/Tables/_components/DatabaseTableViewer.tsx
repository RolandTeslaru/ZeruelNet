import React, { memo, useMemo, useState } from 'react'
import {
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    PaginationState,
} from "@tanstack/react-table"
import { useTablesContext } from '../context';
import { useQuery } from '@tanstack/react-query';
import { fetchComments, fetchKnowledgeSubjects, fetchTableColumns, fetchTableMeta, fetchVideoFeatures, fetchVideos } from '@/lib/api/database';
import { Checkbox, Spinner } from '@zeruel/shared-ui/foundations';
import { DataTable } from '@/components/DataTable';

const EMPTY_DATA = []

const DatabaseTableViewer = memo(() => {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    const { selectedTable, queryParams } = useTablesContext();

    // Fetch schema for the table that contains the columns
    const { data: columns, isLoading: isSchemaLoading } = useQuery({
        queryKey: ['tableColumns', selectedTable],
        queryFn: async () => {
            const data = await fetchTableColumns(selectedTable)
            return data.map(col => ({
                accessorKey: col.column_name,
                header: col.column_name.replace(/_/g, ' ').toUpperCase(),
            }))
        },
        staleTime: Infinity,
    });


    // Fetch the selected table
    const { data, isLoading: isDataLoading } = useQuery({
        queryKey: [selectedTable, { pageIndex, pageSize, queryParams }],
        queryFn: () => {
            const baseParams = { limit: pageSize, offset: pageIndex * pageSize };
            const paramsWithFilters = { ...baseParams, ...(queryParams ?? {}) } as any;
            switch (selectedTable) {
                case 'video_features':      return fetchVideoFeatures(paramsWithFilters);
                case 'comments':            return fetchComments(paramsWithFilters);
                case 'videos':              return fetchVideos(paramsWithFilters);
                case 'knowledge_subjects':  return fetchKnowledgeSubjects(paramsWithFilters)
            }
        },
        // Only run this query if the schema has been successfully loaded
        enabled: !!columns,
    });

    const defaultData = [];

    const pagination = useMemo(() => ({
        pageIndex,
        pageSize,
    }), [pageIndex, pageSize]);

    const table = useReactTable({
        data: data?.items ?? defaultData,
        columns,
        pageCount: data?.page.total ? Math.ceil(data.page.total / pageSize) : -1,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    if (isSchemaLoading || isDataLoading) {
        return <div className='size-full'><Spinner /></div>;
    }

    return (
        <div className='flex flex-col h-full'>

            <DataTable data={data ? data.items : EMPTY_DATA} columns={columns} table={table} />
        </div>
    );
})

export default DatabaseTableViewer