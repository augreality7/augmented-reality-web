"use client"

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import iconLight from "@/public/assets/images/logo.png";
import iconDark from "@/public/assets/images/logo.png";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import MainNavigation from "./main-navigation";
import DropdownSettings from "./dropdown-settings";
import useMenuModal from "@/hook/use-menu-modal";
import { Menu } from "lucide-react";
import useMount from "@/hook/use-mount";
import { IronSession } from "iron-session";
import { SessionData } from "@/lib/lib";
import { UserData } from "../navbar";

interface MenuNavProps {
    session: IronSession<SessionData>
    user: UserData | undefined
}

const MenuNav: React.FC<MenuNavProps> = ({
    session,
    user
}) => {

    const { theme } = useTheme();
    const menuModal = useMenuModal();
    const { isMounted, setIsMounted } = useMount();

    const openMenu = () => {
        menuModal.onOpen();
    }

    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
        }, 2000);
    }, []);

    return (
        <>
            {
                !isMounted ?
                    <Skeleton className="ml-6 h-12 w-12 rounded-full" />
                    :
                    <Link href="/dashboard-page" className="ml-4 lg:ml-0 flex items-center hover:scale-105 transition">
                        {theme === 'dark' ? (<>
                            <Image src={iconDark} alt="" height={100} width={100} priority />
                        </>)
                            :
                            <></>
                        }
                        {theme === 'light' ? (<>
                            <Image src={iconLight} alt="" height={100} width={100} priority />
                        </>)
                            :
                            <></>
                        }
                    </Link>
            }
            <MainNavigation isMounted={isMounted} />
            <DropdownSettings isMounted={isMounted} session={session} user={user} />
            <Menu onClick={() => openMenu()} className="flex lg:hidden hover:scale-110 cursor-pointer transition mr-4" size={30} />
        </>
    )
}

export default MenuNav;