"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@zeruel/shared-ui/Table"
import * as React from "react"

import { DataTablePagination } from "@/components/Table/DataTablePagination"

import { DataTableBulkEditor } from "@/components/Table/TableBulkEditor"

import {
    ColumnDef,
    Row,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { cx } from "@/lib/utils"

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[]
    data: TData[]
    onRowClick?: (row: Row<TData>) => void
    table: ReturnType<typeof useReactTable<TData>>
}

export function DataTable<TData>({
    columns,
    table,
}: DataTableProps<TData>) {
    return (
        <>
            <Table className="!max-w-full">
                <TableHead className="sticky top-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className=""
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHeaderCell
                                    key={header.id}
                                    className={cx(
                                        "whitespace-nownowrap font-mono  py-1",
                                        header.column.columnDef.meta?.className,
                                    )}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody className="[&>tr:nth-child(odd)]:bg-neutral-800/50 [&>tr:nth-child(odd)]:hover:bg-gray-500/40 !max-w-full ">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="group select-none  hover:bg-gray-500/40"
                            >
                                {row.getVisibleCells().map((cell, index) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cx(
                                            row.getIsSelected()
                                                ? "bg-blue-500/20"
                                                : "",
                                            "relative text-xs font-roboto-mono  whitespace-nowrap py-1 dark:text-neutral-400 text-neutral-400",
                                            cell.column.columnDef.meta?.className,
                                        )}
                                    >
                                        {index === 0 && row.getIsSelected() && (
                                            <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-500 dark:bg-blue-500" />
                                        )}
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <DataTableBulkEditor table={table} rowSelection={table.getState().rowSelection} />
            <DataTablePagination table={table} />

        </>
    )
}