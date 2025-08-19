import { fetchTableSchema, fetchVideoFeatures } from '@/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Checkbox, Spinner } from '@zeruel/shared-ui/foundations';
import React, { memo, useMemo, useState } from 'react'
import { DataTable } from '@/components/DataTable';

const EMPTY_DATA: any[] = []

const EnrichmentDataTable = memo(() => {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    // Fetch schema for the table that contains the columns
    const { data: schemaData, isLoading: isSchemaLoading } = useQuery({
        queryKey: ['tableSchema', 'video_features'],
        queryFn: () => fetchTableSchema({ tableName: 'video_features' }),
        staleTime: Infinity, // Schema is static, cache it forever
    });

    // Fetch the selected table
    const { data, isLoading: isDataLoading } = useQuery({
        queryKey: ['video_features', { pageIndex, pageSize }],
        queryFn: () => {
            const baseParams = { limit: pageSize, offset: pageIndex * pageSize };
            return fetchVideoFeatures(baseParams);
        },
        // Only run this query if the schema has been successfully loaded
        enabled: !!schemaData,
    });

    const defaultData = useMemo(() => [], []);

    // Generate columns array
    const columns = useMemo<ColumnDef<any>[]>(() => {
        if (!schemaData) return [];

        const generatedColumns = schemaData.map((col) => ({
            accessorKey: col.column_name,
            header: col.column_name.replace(/_/g, ' ').toUpperCase(),
        }));

        // Add the manual "select" column to the front
        return [
            {
                id: "select",
                header: ({ table }) => (<Checkbox />),
                cell: ({ row }) => (<Checkbox />),
            },
            ...generatedColumns,
        ];
    }, [schemaData]);

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
        return <div className='size-full flex items-center justify-center'><Spinner /></div>;
    }

    return (
        <DataTable data={data ? data.items : EMPTY_DATA} columns={columns} table={table} />
    );
})

export default EnrichmentDataTable