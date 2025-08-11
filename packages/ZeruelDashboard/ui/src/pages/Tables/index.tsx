import { DataTable } from '@/pages/Tables/_components/DataTable';
import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import { Variants } from 'motion/react';
import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { VideosQueryParams } from '@zeruel/dashboard-types';
import { fetchVideos, fetchComments, fetchVideoFeatures, fetchTableSchema } from '@/lib/api';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    sortingFns,
    ColumnDef,
    Row,
    PaginationState,
} from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zeruel/shared-ui/foundations';
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel';
import { TablesProvider, useTablesContext } from './context';
import { Checkbox } from '@zeruel/shared-ui/foundations';



const Tables = React.memo(({ show }: { show: boolean }) => {
    return (
        <TablesProvider>

            <div className='flex flex-row gap-4 size-full max-w-full max-h-full'>
                <VXWindow
                    vxWindowId='ZNDashboardTableInfoWindow'
                    title='ZeruelNet Dashboard: Table Info Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='   min-w-[300px] h-[80vh] min-h-[80vh] p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DataTreePanel />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZNDashboardTabelWindow'
                    title='ZereulNet Dashboard: Table Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className=' bg-neutral-950/30 max-w-[60vw] mx-auto h-[80vh] min-h-[80vh] p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseTable />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZNDashboardTableQueryWindow'
                    title='ZeruelNet Dashboard: Table Query Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='  min-w-[300px]  h-[80vh] min-h-[80vh] p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DataQueryPanel />
                </VXWindow>
            </div>
        </TablesProvider>
    )
})

export default Tables

const EMPTY_DATA: any[] = []

const DATA_TABLES = [
    "videos",
    "video_features",
    "comments"
]

const DatabaseTable = () => {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    const { selectedTable } = useTablesContext();

    // STEP 1: Fetch the schema for the selected table
    const { data: schemaData, isLoading: isSchemaLoading } = useQuery({
        queryKey: ['tableSchema', selectedTable],
        queryFn: () => fetchTableSchema({ tableName: selectedTable as 'videos' | 'video_features' | 'comments' }),
        staleTime: Infinity, // Schema is static, cache it forever
    });

    // STEP 2: Fetch the data for the selected table
    const { data, isLoading: isDataLoading } = useQuery({
        queryKey: [selectedTable, { pageIndex, pageSize }],
        queryFn: () => {
            const baseParams = { limit: pageSize, offset: pageIndex * pageSize };
            switch (selectedTable) {
                case 'video_features': return fetchVideoFeatures(baseParams);
                case 'comments': return fetchComments(baseParams);
                case 'videos':
                default: return fetchVideos(baseParams);
            }
        },
        // Only run this query if the schema has been successfully loaded
        enabled: !!schemaData,
    });

    const defaultData = useMemo(() => [], []);

    // STEP 3: Generate the columns array dynamically from the schema
    const columns = useMemo<ColumnDef<any>[]>(() => {
        if (!schemaData) return []; // Return empty array while schema is loading
        console.log("Schema Data" , schemaData)
        // Map the schema response to TanStack Table's ColumnDef format
        const generatedColumns = schemaData.map((col) => ({
            accessorKey: col.column_name,
            header: col.column_name.replace(/_/g, ' ').toUpperCase(),
        }));
        
        // Add the manual "select" column to the front
        return [
            {
                id: "select",
                header: ({ table }) => (<Checkbox/>),
                cell: ({ row }) => (<Checkbox/>),
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
        columns, // <-- Now using the dynamically generated columns
        pageCount: data?.page.total ? Math.ceil(data.page.total / pageSize) : -1,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    // Handle loading states
    if (isSchemaLoading || isDataLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='relative size-full overflow-scroll'>
            <DataTable data={data ? data.items : EMPTY_DATA} columns={columns} table={table} />
        </div>
    );
};


const DataQueryPanel = () => {
    const { selectedTable, setSelectedTable } = useTablesContext()

    return (
        <CollapsiblePanel
            title='Query Tool'
        >
            <Select
                defaultValue={selectedTable}
                onValueChange={(value) => {
                    setSelectedTable(value)
                }}
            >
                <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                    <SelectValue placeholder="Select a Table" />
                </SelectTrigger>
                <SelectContent>
                    {DATA_TABLES.map((key) => (
                        <SelectItem key={key} value={key}>
                            {key}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CollapsiblePanel>
    )
}

const DataTreePanel = () => {
    return (
        <CollapsiblePanel
            title="Data Tree"
        >
        </CollapsiblePanel>
    )
}