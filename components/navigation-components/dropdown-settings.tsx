import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, CircleHelp, CircleUserRound, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ModeToggle } from "../theme-toggle";
import { Skeleton } from "../ui/skeleton";
import { ChangeEvent, useEffect, useState } from "react";
import { IronSession } from "iron-session";
import { SessionData } from "@/lib/lib";
import { Separator } from "../ui/separator";
import ChangeImageAndName from "./change-image-and-name";
import { UserData } from "../navbar";
import { storage } from "@/firebase";
import { ref as storageRef, uploadBytes } from "@firebase/storage";
import { database } from "@/firebase";
import { getDownloadURL } from "@firebase/storage";
import { onValue, ref, update } from "firebase/database";

interface DropdownSettingsProps {
    isMounted: boolean,
    session: IronSession<SessionData>
    user: UserData | undefined
}

type Verification = {
    id: string
    email: string;
    creationTime: string;
    verified: boolean
}

const DropdownSettings: React.FC<DropdownSettingsProps> = ({
    isMounted,
    session,
    user
}) => {

    const emailParts = session.email?.split('@');
    const email = emailParts ? emailParts[0] : 'Unknown';

    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState<File>()
    const [displayName, setDisplayName] = useState('');
    const [dataVerify, setDataVerify] = useState<Verification[]>([]);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImage(file);
    };

    useEffect(() => {

        const verifyDataRef = ref(database, 'mobile/users');

        const fetchData = (snapshot: any) => {
            const verifyData = snapshot.val();
            if (verifyData) {
                const verifyArray: Verification[] = Object.keys(verifyData).map(key => ({
                    id: key,
                    ...verifyData[key]
                }));

                setDataVerify(verifyArray);
            }
        };

        onValue(verifyDataRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(verifyDataRef, fetchData);
        };
    }, []);

    const onSubmit = async () => {
        if (image) {
            try {
                const storageReference = storageRef(storage, `images/${image.name}`);
                await uploadBytes(storageReference, image);

                const downloadURL = await getDownloadURL(storageReference);
                await update(ref(database, `users/${session.uid}`), {
                    photoURL: downloadURL,
                    displayName: displayName ? displayName : ""
                });

                toast.success('Image Uploaded.');

            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Something went wrong.');
            } finally {
                setUploading(false);
                setOpen(false);
                setImage(undefined);
                setDisplayName('');
            }
        }
    }

    const signOut = async () => {
        try {
            const response = await axios.post('/api/signOut');
            if (response.data.status === 200) {
                router.push("/auth");
            }

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        }
    }
    // add account page

    return (
        <div className="hidden lg:flex gap-2">
            {!isMounted ?
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[190px]" />
                    <Skeleton className="h-10 w-[40px]" />
                </div>
                :
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="relative text-xs font-semibold" variant={"outline"}>
                                {
                                    dataVerify.filter(data => data.verified === false).length === 0 ?
                                        ''
                                        :
                                        < div className="absolute -right-2 -top-2 bg-red-500 p-1 px-2 rounded-full text-xs">
                                            <div>{dataVerify.filter(data => data.verified === false).length}</div>
                                        </div>
                                }
                                <Avatar className="h-8 w-8 mr-1">
                                    <AvatarImage src={`${user?.photoURL ? user.photoURL : 'https://github.com/shadcn.png'}`} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                {user?.displayName ? user.displayName : email}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-col gap-2">
                            <DropdownMenuItem onClick={() => setOpen(!open)} className="font-medium"><CircleUserRound className="h-4 w-4 mr-2" />Account</DropdownMenuItem>
                            <Separator />
                            <DropdownMenuItem onClick={signOut} className="font-medium">
                                <Button className="w-full">
                                    <LogOut className="h-4 w-4 mr-2" />Sign out
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ModeToggle />
                </>
            }
            <ChangeImageAndName open={open} setOpen={setOpen} handleUpload={handleUpload} uploading={uploading} setDisplayName={setDisplayName} displayName={displayName} onSubmit={onSubmit} image={image} />
        </div >
    )
}

export default DropdownSettings;