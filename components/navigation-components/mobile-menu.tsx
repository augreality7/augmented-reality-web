"use client";

import { Footprints, Home, Newspaper, UsersIcon, X } from "lucide-react";
import useMenuModal from "@/hook/use-menu-modal";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";

const MobileMenu = () => {

    const menuModal = useMenuModal();
    const { theme } = useTheme();
    const pathname = usePathname();

    const routes = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: <Home className="h-4 w-4 mr-1" />,
            active: pathname === '/dashboard'
        },
        {
            href: '/timein-timeout',
            label: 'Time-in/Time-out',
            icon: <Footprints className="h-4 w-4 mr-1" />,
            active: pathname === '/timein-timeout'
        },
        {
            href: '/news-update',
            label: 'News/Updates',
            icon: <Newspaper className="h-4 w-4 mr-1" />,
            active: pathname === '/news-update'
        },
        {
            href: '/manage-user',
            label: 'Manage Users',
            icon: <UsersIcon className="h-4 w-4 mr-1" />,
            active: pathname === '/manage-user'
        }
    ];

    return (
        <div className={`fixed z-30 lg:hidden top-0 left-0 w-full h-full ${theme === 'dark' ? 'bg-[#020817]' : 'bg-white'} px-4 overflow-y-scroll`}>
            <div className="flex lg:hidden items-center justify-end p-4 sm:p-6">
                <X onClick={() => menuModal.onClose()} className="hover:scale-110 cursor-pointer transition" />
            </div>
            <div className="flex flex-col p-4 sm:p-6 space-y-8">
                {routes.map((route) => (
                    <Link onClick={() => menuModal.onClose()} key={route.href} href={route.href}
                        className={`${route.active ? ` ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F4F4F4]'} text-[#327be9] ` : ''} px-4 h-24 font-semibold flex items-center rounded-xl cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-[#fff7f4]'} transition-colors`}>
                        {route.icon}
                        {route.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default MobileMenu;