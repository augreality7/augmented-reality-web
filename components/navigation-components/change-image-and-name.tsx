"use client";

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImagePlus } from "lucide-react";
import { useTheme } from "next-themes";

interface ChangeImageAndNameProps {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    handleUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
    uploading: boolean
    setDisplayName: Dispatch<SetStateAction<string>>
    displayName: string
    onSubmit: () => Promise<void>
    image: File | undefined
}

const ChangeImageAndName: React.FC<ChangeImageAndNameProps> = ({
    open,
    setOpen,
    handleUpload,
    uploading,
    setDisplayName,
    displayName,
    onSubmit,
    image
}) => {

    const { theme } = useTheme();

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const handleOnOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setOpen(false);
        }
    }

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setImageUrl(url);
            // Revoke the object URL after the image is loaded to free up memory
            return () => URL.revokeObjectURL(url);
        } else {
            setImageUrl(undefined);
        }
    }, [image]);

    return (
        <Dialog open={open} onOpenChange={handleOnOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-10">
                    <div className="relative flex justify-center">
                        <Avatar className="h-48 w-48">
                            <AvatarImage src={`${imageUrl ? imageUrl : 'https://github.com/shadcn.png'}`} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="absolute right-28 hover:scale-105 cursor-pointer">
                            <div className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} relative z-10 p-1 rounded-full cursor-pointer`}>
                                <ImagePlus className="h-6 w-6 cursor-pointer" />
                                <Input
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUpload(e)}
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="displayname">
                            Display Name:
                        </Label>
                        <Input
                            id="displayname"
                            placeholder="Enter Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button disabled={uploading} onClick={onSubmit} type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ChangeImageAndName;