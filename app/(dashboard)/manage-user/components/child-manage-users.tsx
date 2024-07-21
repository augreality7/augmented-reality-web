"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useMount from "@/hook/use-mount";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";
import { SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { User, columns } from "./columns";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersVertical } from "lucide-react";
import { useTheme } from "next-themes";

const ChildManageUsers = () => {

    const { theme } = useTheme();

    const { isMounted } = useMount();
    const [data, setData] = useState<User[]>([]);
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

    useEffect(() => {

        const userRef = ref(database, `user`);

        const fetchData = (snapshot: any) => {
            const userData = snapshot.val();
            if (userData) {
                const userArray: User[] = Object.keys(userData).map(key => ({
                    id: key,
                    ...userData[key]
                }));

                setData(userArray);

            }
        };

        onValue(userRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(userRef, fetchData);
        };
    }, []);

    return (
        <div className="flex flex-col space-y-4 p-8 w-full h-full">
            <div className="flex flex-col gap-2">
                {
                    !isMounted ?
                        <Skeleton className="h-7 w-96" />
                        :
                        <div className="text-3xl poppins-black">
                            Manage Users
                        </div>
                }
                {
                    !isMounted ?
                        <Skeleton className="h-6 w-24 mt-2" />
                        :
                        <div className=" text-sm text-gray-500 poppins-bold">
                            Administer user accounts, roles, and activities.
                        </div>
                }
            </div>
            {
                !isMounted ?
                    <Skeleton className="h-[410px] w-full mt-2" />
                    :
                    <div className={`flex flex-col gap-4 ${theme === 'dark' ? ' bg-[#172030]' : 'bg-[#F4F4F4]'} p-4 rounded-lg`}>
                        <div className="flex justify-between item-center md:grid md:grid-cols-12">
                            <div className="md:col-span-7 text-xl font-semibold flex items-center">
                                User List
                            </div>
                            <div className="md:col-span-5 flex items-center gap-2">
                                <Input
                                    placeholder="Search"
                                    value={globalFilter}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    className="w-2/3"
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="text-xs w-1/3">
                                            <SlidersVertical className="h-4 w-4 mr-1" />Advance
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {table
                                            .getAllColumns()
                                            .filter(
                                                (column) => column.getCanHide()
                                            )
                                            .map((column) => {
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={column.id}
                                                        className="capitalize"
                                                        checked={column.getIsVisible()}
                                                        onCheckedChange={(value) =>
                                                            column.toggleVisibility(!!value)
                                                        }
                                                    >
                                                        {column.id}
                                                    </DropdownMenuCheckboxItem>
                                                )
                                            })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <DataTable columns={columns} data={data} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} table={table} />
                    </div>
            }
        </div>
    )
}

export default ChildManageUsers;