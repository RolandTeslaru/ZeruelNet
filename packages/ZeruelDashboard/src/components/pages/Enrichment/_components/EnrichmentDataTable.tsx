import { fetchTableColumns, fetchTableMeta, fetchVideoFeatures } from '@/lib/api/database';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { CommandBar, CommandBarBar, CommandBarCommand, CommandBarSeperator, CommandBarValue, Input, Spinner } from '@zeruel/shared-ui/foundations';
import React, { memo, useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/DataTable';
import { useEnrichmentViewer } from '../context';
import Search from '@zeruel/shared-ui/Search';
import { DataTableBulkEditorProps } from '@/components/Table/TableBulkEditor';
import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator';

const EMPTY_DATA: any[] = []


const EnrichmentDataTable = memo(() => {
    const [searchVideoId, setSearchVideoId] = useState<string | undefined>();
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    // Fetch schema for the table that contains the columns
    const { data: columns, isLoading: isSchemaLoading } = useQuery({
        queryKey: ['tableColumns', 'video_features'],
        queryFn: async () => {
            const data = await fetchTableColumns("video_features")
            return data.map(col => ({
                accessorKey: col.column_name,
                header: col.column_name.replace(/_/g, ' ').toUpperCase(),
            }))
        },
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
        enabled: !!columns,
    });

    const defaultData = useMemo(() => [], []);

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
        if (data?.items[0]) {
            setSelectedVideoId(data.items[0].video_id)
            setSelectedVideoData(data.items[0])
        }
    }, [data])

    if (isSchemaLoading || isDataLoading) {
        return <DataLoadingIndicator/>;
    }

    return (
        <div className='h-full flex flex-col gap-2'>
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
            >
            </DataTable >
        </div>
    );
})

export default EnrichmentDataTable

const DataTableBulkEditor: React.FC<DataTableBulkEditorProps<any>> = ({ table, rowSelection }) => {
    const { selectedVideoId } = useEnrichmentViewer()
    return (
        <CommandBar open={!!selectedVideoId}>
            <CommandBarBar>
                <CommandBarValue className="text-nowrap text-xs text-neutral-300 font-roboto-mono px-1">
                    {Object.keys(rowSelection).length} selected
                </CommandBarValue>
                <CommandBarSeperator />
                <CommandBarCommand
                    label="Run Enrichment"
                    action={() => {
                        console.log("Edit")
                    }}
                    shortcut={{ shortcut: "r" }}
                />
                <CommandBarSeperator />
             
            </CommandBarBar>
        </CommandBar>
    )
}