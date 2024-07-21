"use client";

import { useEffect, useState } from "react"
import { useTheme } from "next-themes";

import MenuNav from "./navigation-components/menu";
import useMenuModal from "@/hook/use-menu-modal";
import MobileMenu from "./navigation-components/mobile-menu";
import { IronSession } from "iron-session";
import { SessionData } from "@/lib/lib";
import { onValue, ref, update } from "firebase/database";
import { database } from "@/firebase";
import { useToast } from "./ui/use-toast";
import { format } from "date-fns";

interface NavbarProps {
    session: IronSession<SessionData>
}

export type UserData = {
    displayName: string;
    photoURL: string
}

const Navbar: React.FC<NavbarProps> = ({
    session
}) => {

    const [scrollY, setScrollY] = useState(0);
    const { theme } = useTheme();
    const { toast } = useToast()
    const menuModal = useMenuModal();

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
    }, [scrollY]);

    const [user, setUser] = useState<UserData>();

    useEffect(() => {

        const userRef = ref(database, `admin/${session.uid}`);

        const fetchData = (snapshot: any) => {
            const userData = snapshot.val();
            if (userData) {
                const userArray: UserData[] = Object.keys(userData).map(key => ({
                    id: key,
                    ...userData[key]
                }));

                setUser(userData);
            }
        };

        onValue(userRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(userRef, fetchData);
        };
    }, []);


    return (
        <>
            <div className={`${theme === 'dark' ? 'bg-[#020817]' : ''} ${theme === 'light' ? 'bg-white' : ''} sticky top-0 z-20 ${scrollY === 0 ? '' : 'border-b transition-all duration-300 ease-out'}`}>
                <div className="relative px-2 sm:px-4 lg:px-8 flex h-20 items-center justify-between">
                    <MenuNav session={session} user={user} />
                </div>
            </div>
            {menuModal.isOpen && <MobileMenu />}
        </>
    )
}

export default Navbar;
