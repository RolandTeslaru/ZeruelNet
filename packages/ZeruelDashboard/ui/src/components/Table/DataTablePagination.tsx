import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from "@zeruel/shared-ui/icons"
  import { Table } from "@tanstack/react-table"
  
  import { Button } from "@zeruel/shared-ui/foundations"
  
  interface DataTablePaginationProps<TData> {
    table: Table<TData>
  }
  
  export function DataTablePagination<TData>({
    table,
  }: DataTablePaginationProps<TData>) {
    return (
      <div className="flex w-full items-center justify-between">
        <div className=" flex-1 text-xs  font-roboto-mono text-neutral-300">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-4 lg:space-x-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="dashed1"
              className="hidden h-5 w-8 p-0 lg:flex text-neutral-200"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="dashed1"
              className="h-5 w-8 p-0 text-neutral-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-[100px] text-neutral-300 font-roboto-mono items-center justify-center text-xs font-medium">
              Page {table.getState().pagination.pageIndex + 1}/
              {table.getPageCount()}
            </div>
            <Button
              variant="dashed1"
              className="h-5 w-8 p-0 text-neutral-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="dashed1"
              className="hidden h-5 w-8 p-0 lg:flex text-neutral-200"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
