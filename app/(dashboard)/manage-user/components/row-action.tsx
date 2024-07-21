"use client"

import { Button } from "@/components/ui/button";
import { Row, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal, SlidersVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { User } from "./columns";
import { DataTable1 } from "./data-table1";
import { UserLogs, columns } from "./column1";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase";

interface RowActionProps {
    row: Row<User>
}

const RowAction: React.FC<RowActionProps> = ({
    row
}) => {

    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    const [data, setData] = useState<UserLogs[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    useEffect(() => {

        const userRef = ref(database, `user/${row.original.id}/logs`);

        const fetchData = (snapshot: any) => {
            const userData = snapshot.val();
            if (userData) {
                const userArray: UserLogs[] = Object.keys(userData).map(key => ({
                    id: key,
                    ...userData[key],
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


    const onOpen = () => {
        setOpen(true);
    }

    const handleOnOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setOpen(false);
        }
    }

    const onOpen2 = () => {
        setOpen2(true);
    }

    const handleOnOpenChange2 = (isOpen: boolean) => {
        if (!isOpen) {
            setOpen2(false);
        }
    }

    const onDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/deleteUser', {
                id
            });

            if (response.data.status === 200) {
                toast.success("User has been deleted.");
            }
        } catch (error) {
            console.log(error);
            toast.error('Someting went wrong.');
        } finally {
            setLoading(false);
            setOpen2(false);
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit flex flex-col gap-1">
                <div className="text-sm font-bold">
                    Action
                </div>
                <Separator />
                <Dialog open={open} onOpenChange={handleOnOpenChange}>
                    <DialogTrigger onClick={onOpen} asChild>
                        <Button variant={"ghost"} size={"sm"} className="text-xs font-bold text-[#327be9]  cursor-pointer">
                            View logs
                        </Button>
                    </DialogTrigger>
                    <DialogContent className=" max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="poppins-black text-2xl">Logs</DialogTitle>
                            <DialogDescription className="poppins-bold text-xs">
                                View the logs of this user
                            </DialogDescription>
                        </DialogHeader>
                        <div className={`flex flex-col gap-4 ${theme === 'dark' ? ' bg-[#172030]' : 'bg-[#F4F4F4]'} p-4 rounded-lg`}>
                            <div className="flex justify-between item-center md:grid md:grid-cols-12">
                                <div className="md:col-span-7 text-xl font-semibold flex items-center">
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
                            <DataTable1 columns={columns} data={data} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} table={table} />
                        </div>
                    </DialogContent>
                </Dialog>
                <Separator />
                <AlertDialog open={open2} onOpenChange={handleOnOpenChange2}>
                    <AlertDialogTrigger onClick={onOpen2} asChild>
                        <Button variant={"ghost"} size={"sm"} className="text-xs text-red-500 cursor-pointer">
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your data from the server.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button onClick={() => onDelete(row.original.id)} variant={"destructive"} className={`cursor-pointer ${theme === 'dark' ? 'border-black' : 'border-white'}`}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </PopoverContent>
        </Popover>
    )
}

export default RowAction;