"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@zeruel/shared-ui/foundations"
import { Video } from "./schema"


export const columns: ColumnDef<Video>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
            // @ts-expect-error
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "video_id",
        header: "Video ID",
    },
    {
        accessorKey: "author_username",
        header: "Author",
    },
    {
        accessorKey: "video_description",
        header: "Description",
    },
    {
        accessorKey: "likes_count",
        header: "Likes",
    },
    {
        accessorKey: "share_count",
        header: "Shares",
    },
    {
        accessorKey: "comment_count",
        header: "Comments",
    },
    {
        accessorKey: "play_count",
        header: "Plays",
    },
    {
        accessorKey: "created_at",
        header: "Created At",
    },
] 