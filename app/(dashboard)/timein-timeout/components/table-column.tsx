import { useState } from "react";
import { SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Logs, columns } from "./column";
import { DataTable } from "./data-table";

interface TableColumnProps {
    data: Logs[]
}

const TableColumn: React.FC<TableColumnProps> = ({
    data
}) => {

    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
            columnVisibility,
            sorting,
        },
    });

    return (
        <div className="col-span-6 flex justify-center relative mt-8">
            <div className="w-[90%] lg:w-fit">
                <DataTable columns={columns} data={data} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} table={table} />
            </div>
        </div>
    )
}

export default TableColumn;