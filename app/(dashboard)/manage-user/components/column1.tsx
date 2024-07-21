"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
// import RowAction from "./row-action";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserLogs = {
    id: string
    action: string
    createdAt: string
}

export const columns: ColumnDef<UserLogs>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "action",
        header: "Action",
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    className="poppins-bold"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div>
                {format(row.original.createdAt, 'MMM dd, yyyy hh:mm aaa')}
            </div>
        ),
    }
]
