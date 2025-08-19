import { fetchTableSchema, fetchVideoFeatures } from '@/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Input, Spinner } from '@zeruel/shared-ui/foundations';
import React, { memo, useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/DataTable';
import { useEnrichmentViewer } from '../context';
import Search from '@zeruel/shared-ui/Search';

const EMPTY_DATA: any[] = []

const EnrichmentDataTable = memo(() => {
    const [searchVideoId, setSearchVideoId] = useState<string | undefined>();
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    // Fetch schema for the table that contains the columns
    const { data: schemaData, isLoading: isSchemaLoading } = useQuery({
        queryKey: ['tableSchema', 'video_features'],
        queryFn: () => fetchTableSchema({ tableName: 'video_features' }),
        staleTime: Infinity,
    });

    // Fetch the selected table
    const { data, isLoading: isDataLoading } = useQuery({
        queryKey: ['video_features', { pageIndex, pageSize, video_id: searchVideoId }],
        queryFn: () => {
            const baseParams = {
                limit: pageSize,
                offset: pageIndex * pageSize,
                video_id: searchVideoId,
            };
            return fetchVideoFeatures(baseParams);
        },
        // Only run this query if the schema has been successfully loaded
        enabled: !!schemaData,
    });

    const defaultData = useMemo(() => [], []);

    // Generate columns array ( also selection happens on row click )
    const columns = useMemo<ColumnDef<any>[]>(() => {
        if (!schemaData) return [];

        return schemaData.map((col) => ({
            accessorKey: col.column_name,
            header: col.column_name.replace(/_/g, ' ').toUpperCase(),
        }));
    }, [schemaData]);

    const pagination = useMemo(() => ({
        pageIndex,
        pageSize,
    }), [pageIndex, pageSize]);

    const { rowSelection, setRowSelection, setSelectedVideoId, setSelectedVideoData } = useEnrichmentViewer()

    const handleRowSelectionChange = (updater: any) => {
        let newSelection: Record<string, boolean>;

        if (typeof updater === 'function') {
            newSelection = updater(rowSelection);
        } else {
            newSelection = updater;
        }

        setRowSelection(newSelection);
        const newSelectedId = Object.keys(newSelection)[0];
        
        setSelectedVideoData(data.items?.[newSelectedId])

        setSelectedVideoId(newSelectedId);
    };

    const table = useReactTable({
        data: data?.items ?? defaultData,
        columns,
        enableMultiRowSelection: false,
        enableRowSelection: true,
        pageCount: data?.page.total ? Math.ceil(data.page.total / pageSize) : -1,
        state: {
            pagination,
            rowSelection,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: handleRowSelectionChange,
        manualPagination: true,
        getRowId: (originalRow: any) => originalRow.id,
    });

    useEffect(() => {
        setRowSelection({ 0: true })
        if(data?.items[0]){
            setSelectedVideoId(data.items[0].video_id)
            setSelectedVideoData(data.items[0])
        }
    }, [data])

    if (isSchemaLoading || isDataLoading) {
        return <div className='size-full flex items-center justify-center'><Spinner /></div>;
    }

    return (
        <>
            <Input
                placeholder='search video id'
                className='w-[200px] ml-2'
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setSearchVideoId(e.currentTarget.value || undefined);
                    }
                }}
            />
            <DataTable
                data={data ? data.items : EMPTY_DATA}
                columns={columns}
                table={table}
            />
        </>
    );
})

export default EnrichmentDataTable