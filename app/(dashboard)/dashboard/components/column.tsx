"use client"

import { ColumnDef } from "@tanstack/react-table"

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
        header: "Time-in",
    },
    {
        accessorKey: "timeOut",
        header: "Time-out",
    },
]
