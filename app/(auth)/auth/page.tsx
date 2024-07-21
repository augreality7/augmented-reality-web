"use client";

import { ModeToggle } from "@/components/theme-toggle";
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/controller';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CircleUserRound, LogIn } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SignInForm from "@/components/signin-form";
import SignUpForm from "@/components/signup-form";

import { app, database } from "@/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { createSchema, loginSchema } from "@/lib/types";
import Bowser from "bowser";
import { v4 as uuidv4 } from "uuid";
import useSession from "@/hook/use-session";
import pafIcon from "@/public/assets/images/paf-icon.png";
import logo from "@/public/assets/images/logo.png";
import { useTheme } from "next-themes";

const auth = getAuth(app);


export default function Page() {

    const { theme } = useTheme();
    const { tabValue, setTabValue, loading, setLoading } = useSession();
    const router = useRouter();

    const formLogin = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const form1 = useForm<z.infer<typeof createSchema>>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    function getOSName() {
        const OS = Bowser.getParser(window.navigator.userAgent);
        return OS.getOSName();
    }

    function getBrowserName() {
        const browser = Bowser.getParser(window.navigator.userAgent);
        return browser.getBrowserName();
    }

    function generateShortUUID() {
        return uuidv4().replace(/-/g, '').substring(0, 11);
    }


    const onLogin = async (values: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {

            const response = await axios.post('/api/session', { values });

            if (response.data.status === 200) {
                
                const OS = getOSName();
                const Browser = getBrowserName();

                await set(ref(database, `admin/${response.data.id}/history/${generateShortUUID()}`), {
                    osUsed: OS,
                    browserUsed: Browser,
                    createdAt: Date.now()
                });

                formLogin.reset();
                setTabValue('login');
                router.push('/dashboard');
            }
        } catch (error) {
            console.log(error);
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // const onCreateAccount = async (values: z.infer<typeof createSchema>) => {
    //     setLoading(true);
    //     try {
    //         const response = await createUserWithEmailAndPassword(auth, values.email, values.password);
    //         if (response.user) {
    //             //uid,email,displayName,photoURL,reloadUserInfo:passwordHash,metaData:creationTime,metaData:lastSignInTime
    //             await set(ref(database, 'admin/' + response.user.uid), {
    //                 email: response.user.email || '',
    //                 displayName: response.user.displayName || '',
    //                 photoURL: response.user.photoURL || '',
    //                 passwordHash: (response.user as any).reloadUserInfo.passwordHash || '',
    //                 creationTime: response.user.metadata.creationTime || '',
    //                 lastSignInTime: response.user.metadata.lastSignInTime || ''
    //             });

    //             toast.success('User created.');
    //             setTabValue('login');
    //             formLogin.reset();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         toast.error('Something went wrong.');
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    return (
        <div className="flex lg:grid lg:grid-cols-12 h-screen">
            <div className="flex flex-col justify-center items-center lg:col-span-6 w-full">
                <div className="flex justify-center w-full">
                    <div className="flex flex-col w-[70%]">
                        <div className="flex justify-end w-full px-10">
                            <ModeToggle />
                        </div>
                        <div className="h-32 w-32 md:h-40 md:w-40">
                            <Image src={logo} alt='' priority quality={100} />
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className=" text-4xl md:text-5xl poppins-black">
                                Get started
                            </div>
                            <div className="w-[90%]">
                                <SignInForm form={formLogin} onLogin={onLogin} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-6 h-full w-full hidden lg:block p-2">
                <div className={`relative flex flex-col justify-between h-full w-full border-2 ${theme === 'dark' ? 'border-white' : 'border-gray-700'} bg-[url('https://firebasestorage.googleapis.com/v0/b/augmentedreality-20623.appspot.com/o/cool-background.png?alt=media&token=2c6e95eb-bcd5-41db-8364-6b13f4d9d809')] rounded-lg`}>
                    <div className="flex flex-row justify-end p-4">
                        <Badge className="w-fit text-base">
                            admin
                        </Badge>
                    </div>
                    <div className={`absolute top-8 -left-12 p-2 ${theme === 'dark' ? 'bg-[#000205]' : 'bg-white'}  rounded-full`}>
                        <Image height={80} width={80} src={pafIcon} alt='' priority quality={100} />
                    </div>
                    <div className="text-center mb-10">
                        <div className="text-white font-bold text-3xl">
                            PAF interactive tour museum
                        </div>
                        <div className="text-white font-extrabold text-4xl uppercase">
                            Augmented Reality
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
