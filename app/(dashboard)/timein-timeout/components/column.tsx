"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns';
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Logs = {
    id: string
    email: string
    timeIn: string
    timeOut: string
}

export const columns: ColumnDef<Logs>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "email",
        header: "Email"
    },
    {
        accessorKey: "timeIn",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Time-in
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "timeOut",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Time-out
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
]
