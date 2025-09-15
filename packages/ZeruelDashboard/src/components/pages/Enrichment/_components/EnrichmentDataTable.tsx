import { fetchTableColumns, fetchTableMeta, fetchVideoFeatures } from '@/lib/api/database';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Button, CommandBar, CommandBarBar, CommandBarCommand, CommandBarSeperator, CommandBarValue, DialogTitle, Input, Popover, PopoverContent, PopoverItem, PopoverTrigger, Spinner } from '@zeruel/shared-ui/foundations';
import React, { memo, useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/DataTable';
import { useEnrichmentViewer } from '../context';
import Search from '@zeruel/shared-ui/Search';
import { DataTableBulkEditorProps } from '@/components/Table/TableBulkEditor';
import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator';
import { fetchRemoveDeleted, fetchRemoveVideo, fetchRunEnrich, fetchRunOnFailed } from '@/lib/api/enrichment';
import { useWorkflowStatus } from '@/stores/useWorkflowStatus';
import { useSystem } from '@/stores/useSystem';
import { pushDialogStatic } from '@zeruel/shared-ui/UIManager/store';

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
        return <DataLoadingIndicator />;
    }

    return (
        <div className='h-full flex flex-col gap-2'>
            <div className='flex flex-row w-full'>
                <Input
                    placeholder='search video id'
                    className='w-[200px] ml-2'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearchVideoId(e.currentTarget.value || undefined);
                        }
                    }}
                />
                <EnrichmentActions/>
            </div>
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


const EnrichmentActions = () => {

    const setOverrideStage = useSystem(state => state.setOverrideStage)

    const onRemoveDeleted = async () => {
        const data =  await fetchRemoveDeleted()
        .then(({ids, deleted_from_video_features}) => {
            console.log("DELETED ", ids, deleted_from_video_features)
            setOverrideStage({title: `SUCCESSFULLY  DELETED  ${deleted_from_video_features}  VIDEOS`, variant: "SUCCESS"}, 3000)
        })
        .catch(err => {
            console.log("Error removing deleted ", err)
            setOverrideStage({title: "ERROR REMOVING DELETED", variant: "FAILURE"}, 3000)
        })
    }

    const onRunEnrichmentOnFailed = async () => {
        const data = await fetchRunOnFailed()
        .then((data) => {
            setOverrideStage({title: `SUCCESSFULLY QUEUED ${data.failedVideoIds.length} VIDEOS FOR ENRICHMENT`, variant: "SUCCESS"}, 3000)
        })
        .catch(err => {
            console.log("Error running on failed ", err)
            setOverrideStage({title: "ERROR QUEUING VIDEOS FOR ENRICHMENT", variant: "FAILURE"}, 3000)
        })
    }

    const onRunEnrich = async (videoId: string) => {

    }

    return (
        <Popover>
            <PopoverTrigger className='!w-fit ml-auto mr-2'>
                <Button variant='dashed1' size='xs'>
                    <span className='text-xs font-roboto-mono font-medium'>Actions</span>
                </Button>
                <PopoverContent className='flex flex-col gap-1'>
                    <Button onClick={onRemoveDeleted} variant='dashed1' size='sm'>Remove Deleted Videos</Button>
                    <Button onClick={onRunEnrichmentOnFailed} variant='dashed1' size='sm'>Run Enrichment on Failed</Button>
                    <Button onClick={() => {
                        pushDialogStatic({
                            content: <EnrichVideoDialog/>,
                            type: "normal"
                        })
                    } } variant='dashed1' size='sm'>
                        Enrich Video
                    </Button>
                    <Button onClick={() => {
                        pushDialogStatic({
                            content: <RemoveVideoDialog/>,
                            type: "normal"
                        })
                    } } variant='dashed1' size='sm'>
                        Remove Video
                    </Button>
                </PopoverContent>
            </PopoverTrigger>
        </Popover>
    )
}


const EnrichVideoDialog = () => {
    const [videoId, setVideoId] = useState("")

    const setOverrideStage = useSystem(state => state.setOverrideStage)

    const onRunEnrich = async () => {
        if(!videoId || videoId.length === 0) return;
        const data = await fetchRunEnrich({ video_id: videoId })
        .then((data) => {
            setOverrideStage({title: `SUCCESSFULLY QUEUED VIDEO FOR ENRICHMENT`, variant: "SUCCESS"}, 3000)
        })
        .catch(err => {
            console.log("Error running enrichment ", err)
            setOverrideStage({title: "ERROR QUEUING VIDEO FOR ENRICHMENT", variant: "FAILURE"}, 3000)
        })
    }

    return (
        <div className='flex flex-col gap-4'>
            <DialogTitle>
                Enrich Video
            </DialogTitle>
            <Input 
                placeholder='video id'
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
            />
            <Button
                onClick={onRunEnrich}
                disabled={!videoId || videoId.length === 0}
                variant='accent'
            >
                Enrich
            </Button>
        </div>
    )
}

const RemoveVideoDialog = () => {
    const [videoId, setVideoId] = useState("")

    const setOverrideStage = useSystem(state => state.setOverrideStage)

    const onRemoveVideo = async () => {
        if(!videoId || videoId.length === 0) return;
        const data = await fetchRemoveVideo({ video_id: videoId })
        .then((data) => {
            if(data.success){
                setOverrideStage({title: `SUCCESSFULLY REMOVED VIDEO`, variant: "SUCCESS"}, 3000)
            } else {
                setOverrideStage({title: `FAILED TO REMOVE VIDEO`, variant: "FAILURE"}, 3000)
            }
        })
        .catch(err => {
            console.log("Error removing video ", err)
            setOverrideStage({title: "ERROR REMOVING VIDEO", variant: "FAILURE"}, 3000)
        })
    }

    return (
        <div className='flex flex-col gap-4'>
            <DialogTitle>
                Remove Video
            </DialogTitle>
            <Input 
                placeholder='video id'
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
            />
            <Button
                onClick={onRemoveVideo}
                disabled={!videoId || videoId.length === 0}
                variant='accent'
            >
                Remove
            </Button>
        </div>
    )
}