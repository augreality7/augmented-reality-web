"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { format } from 'date-fns';
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button";
// import RowAction from "./row-action";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RowAction from "./row-action";
import { UserLogs } from "./column1";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string
  photoURL: string
  email: string
  logs: []
  active: boolean
  lastSignInTime: string
  creationTime: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "ImageUrl",
    header: "Image",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex justify-center items-center h-auto hover:scale-110 cursor-pointer transition">
            <Image src={row.original.photoURL} width={75} height={125} alt="Barcode" quality={100} />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Image src={row.original.photoURL} width={250} height={300} alt="Barcode" quality={100} />
        </PopoverContent>
      </Popover>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          className="poppins-bold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => {
      return (
        <Button
          className="poppins-bold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className={`${row.original.active === true ? 'text-green-500' : 'text-gray-500'}`}>
        {row.original.active === true ? 'Actived now' : 'Offline'}
      </div>
    ),
  },
  {
    accessorKey: "lastSignInTime",
    header: "Latest Sign-In Time",
    cell: ({ row }) => (
      <div>
        {row.original.lastSignInTime}
      </div>
    ),
  },
  {
    accessorKey: "creationTime",
    header: "Creation Time",
    cell: ({ row }) => (
      <div>
        {row.original.creationTime}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <RowAction row={row} />
      )
    },
  },
]
