import { DataTable } from '@/pages/Tables/_components/DataTable';
import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import { Variants } from 'motion/react';
import React from 'react'
import { columns } from './_components/Columns';
import { useQuery } from '@tanstack/react-query';
import { VideoQueryParams } from '@zeruel/dashboard-types';
import { fetchVideos } from '@/lib/api';
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


const animationVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.5,

        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        }
    },
    visible: {
        opacity: 1,
        scale: 1,
        display: 'flex',
        transition: {
            delay: 0.4,
            duration: 0.3,
            ease: "easeInOut",
        },
    },
};

const Tables = React.memo(({ show }: { show: boolean }) => {
    return (
        <>
            <VXWindow
                vxWindowId='ZNDashboardVideosPanel'
                title='ZereulNet DataHarvester: Scraped Videos Panel'
                windowClasses=''
                StylingComponent={<BracketsWindowStyling
                    className='backdrop-blur-sm bg-neutral-950/30 absolute left-1/2 -translate-x-1/2 w-[70vw] h-[80vh] min-h-[80vh] p-1 flex flex-col'
                    detachedClassName=''
                    show={show}
                />}
            >
                <DatabaseTable />
            </VXWindow>

        </>
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

    const [{ pageIndex, pageSize }, setPagination] =
        React.useState<PaginationState>({
            pageIndex: 0,
            pageSize: 25,
        })


    const params: VideoQueryParams = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        timestamp: "created_at",
        sort: "desc"
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["videos", params],
        queryFn: () => fetchVideos(params),
        staleTime: 30000
    })

    const defaultData = React.useMemo(() => [], [])


    const pagination = React.useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    )


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
        // getSortedRowModel: getSortedRowModel(), 
    })


    return (
        <div className='reolative size-full overflow-scroll'>
            <Select

            >
                <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                    <SelectValue placeholder="Select a Timeline" />
                </SelectTrigger>
                <SelectContent>
                    {DATA_TABLES.map((key) => (
                        <SelectItem key={key} value={key}>
                            {key}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <DataTable data={data ? data.items : EMPTY_DATA} columns={columns} table={table} />
        </div>
    )
}