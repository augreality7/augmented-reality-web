"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BadgePercent, ChevronRight, Clock3, ListChecks, Sparkles, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import useMount from "@/hook/use-mount";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/app/session-context";
import { Logs, columns } from "./column";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase";
import { compareDesc, isSameDay, parseISO } from "date-fns";
import { CustomProgress } from "@/components/ui/customProgress";
import { CustomProgress1 } from "@/components/ui/customProgress1";

type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ value: number }>; // Adjust this type according to your data structure
    label?: string | number;
};

type ChartData = {
    month: string;
    visitor: number;
}

const ChildDashboard = () => {

    const { theme } = useTheme();
    const router = useRouter();
    const session = useSession();
    const { isMounted } = useMount();

    const [selectedYear, setSelectedYear] = useState<string>('2024');
    const [data, setData] = useState<ChartData[]>([]);
    const [logdata, setLogData] = useState<Logs[]>([]);
    const [visitor, setVisitor] = useState<number>(0);
    const [user, setUser] = useState<any[]>([]);
    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [timeIn, setTimeIn] = useState<any[]>([]);
    const [timeinTimeOut, setTimeInTimeOut] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);

    useEffect(() => {

        const userRef = ref(database, `user`);

        const fetchData = (snapshot: any) => {
            const userData = snapshot.val();
            if (userData) {
                const userArray: any[] = Object.keys(userData).map(key => ({
                    id: key,
                    ...userData[key]
                }));

                const activeUsersArray: any[] = Object.keys(userData)
                    .map(key => ({ id: key, ...userData[key] }))
                    .filter(user => user.active === true);

                setUser(userArray);

                setActiveUsers(activeUsersArray);
            }
        };

        onValue(userRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(userRef, fetchData);
        };
    }, []);

    useEffect(() => {
        const dataRef = ref(database, 'visitors');

        const fetchData = (snapshot: any) => {
            const Data = snapshot.val();
            if (Data) {
                const monthCounts: { [key: string]: number } = {
                    Jan: 0,
                    Feb: 0,
                    Mar: 0,
                    Apr: 0,
                    May: 0,
                    Jun: 0,
                    Jul: 0,
                    Aug: 0,
                    Sep: 0,
                    Oct: 0,
                    Nov: 0,
                    Dec: 0,
                };

                let visitorCount = 0;

                // Iterate over each dataId
                Object.keys(Data).forEach(dataId => {
                    const userLogs = Data[dataId];
                    // Iterate over each nested log entry within the dataId
                    Object.keys(userLogs).forEach(logId => {
                        const logEntry = userLogs[logId];
                        const { month, year, dateCreated } = logEntry; // Assuming month is a property in your log entry
                        if (isSameDay(Date.now(), dateCreated)) {
                            visitorCount++
                        }
                        if (year === selectedYear) {
                            // Increment the count for the respective month
                            if (monthCounts.hasOwnProperty(month)) {
                                monthCounts[month]++;
                            }
                        }
                    });
                });

                setVisitor(visitorCount);

                // Transform monthCounts into the desired format
                const transformedData = Object.keys(monthCounts).map(month => ({
                    month,
                    visitor: monthCounts[month],
                }));

                setData(transformedData);
            }
        };

        onValue(dataRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(dataRef, fetchData);
        };
    }, [selectedYear]);

    useEffect(() => {
        const logsRef = ref(database, 'logs');

        const fetchData = (snapshot: any) => {
            const logsData = snapshot.val();
            if (logsData) {
                const logsArray: Logs[] = [];
                const timeInTimeOutLogsArray: any[] = [];
                const timeInLogsArray: any[] = [];
                // Iterate over each dataId
                Object.keys(logsData).forEach(dataId => {
                    const userLogs = logsData[dataId];
                    // Iterate over each nested log entry within the dataId
                    Object.keys(userLogs).forEach(logId => {
                        logsArray.push({
                            id: logId,
                            ...userLogs[logId]
                        });
                    });

                    Object.keys(userLogs).forEach(logId => {
                        const logEntry = userLogs[logId];
                        // Check if both timeIn and timeOut exist
                        if (logEntry.timeIn && logEntry.timeOut) {
                            timeInTimeOutLogsArray.push({
                                id: logId,
                                ...logEntry
                            });
                        }

                        if (logEntry.timeIn && !logEntry.timeOut) {
                            timeInLogsArray.push({
                                id: logId,
                                ...logEntry
                            });
                        }
                    });
                });
                setAllLogs(logsArray);
                setTimeInTimeOut(timeInTimeOutLogsArray);
                setTimeIn(timeInLogsArray)

                const sortedData = logsArray
                    .sort((a, b) => compareDesc(parseISO(a.timeIn), parseISO(b.timeIn)))
                    .slice(0, 3);

                setLogData(sortedData);
            }
        };

        onValue(logsRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(logsRef, fetchData);
        };
    }, []);

    const emailParts = session.email?.split('@');
    const email = emailParts ? emailParts[0] : 'Unknown';

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded-lg border-2 border-gray-200">
                    <p className="poppins-bold text-sm">{`${label} : ${payload[0].value} Visitor/s`}</p>
                    {/* You can customize the tooltip content and style here */}
                </div>
            );
        }

        return null;
    };

    const generateYearOptions = () => {
        const startYear = 2000; // Change this if you want to start from a different year
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = startYear; year <= currentYear; year++) {
            years.push({
                value: year.toString(),
                label: year.toString(),
            });
        }

        return years;
    };

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
    };

    const options = generateYearOptions();

    const totalTimeInTimeOutRate = () => {
        const total = timeinTimeOut.length / allLogs.length;
        const percentage = total * 100;
        return percentage;
    }

    const totalVisitor = () => {
        const totalVisitor = visitor / user.length;
        const percentage = totalVisitor * 100;
        return percentage;
    }

    const totalActiveUser = () => {
        const totalUser = activeUsers.length / user.length;
        const percentage = totalUser * 100;
        return percentage;
    }

    return (
        <div className="flex flex-col md:grid md:grid-cols-12 h-full">
            <div className="flex flex-col gap-8 col-span-9 p-4 sm:border-r-2 sm:border-slate-200">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col gap-2">
                        {
                            !isMounted ?
                                <Skeleton className="h-12 w-60" />
                                :
                                <div className="text-4xl poppins-bold">
                                    Welcome, {email}!
                                </div>
                        }
                        {
                            !isMounted ?
                                <Skeleton className="h-5 w-48" />
                                :
                                <div className="poppins-bold text-gray-500 text-sm">
                                    Here&apos;s an overview of the latest metrics and analytics.
                                </div>
                        }
                    </div>
                    <div className="flex flex-row justify-end">
                        {
                            !isMounted ?
                                <Skeleton className="h-11 w-32" />
                                :
                                <Select value={selectedYear} defaultValue={selectedYear} onValueChange={(value) => handleYearChange(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue defaultValue={selectedYear} placeholder={selectedYear} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                        }
                    </div>
                </div>
                {
                    !isMounted ?
                        <Skeleton className="h-56 w-full" />
                        :
                        <div className="relative flex flex-col">
                            <ResponsiveContainer className={'absolute -left-4'} width="100%" height={240}>
                                <BarChart data={data}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#327be9" />
                                            <stop offset="100%" stopColor="#3246e9" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis fontWeight={500} fontSize={12} stroke={theme === 'dark' ? '#fafbfc' : '#000000'} tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} dataKey="month" />
                                    <YAxis fontWeight={500} fontSize={12} stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar cursor={'pointer'} barSize={20} radius={[4, 4, 4, 4]} dataKey="visitor" stackId="a" fill="url(#colorGradient)" label={{
                                        position: 'top',
                                        formatter: (value: number) => (value === 0 ? '' : ''),
                                        style: {
                                            fontWeight: 'bolder',
                                            fontSize: 12,
                                            fill: '#6B7280',
                                            transform: 'translateY(-5px)'
                                        }
                                    }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                }
                {
                    !isMounted ?
                        <Skeleton className="h-56 w-full" />
                        :
                        <div className="relative flex flex-col mt-56">
                            <div className="flex flex-row justify-between">
                                <div className="text-xl poppins-extrabold">
                                    Latest Time-in/Time-out List
                                </div>
                            </div>
                            <div className="mt-4">
                                <DataTable columns={columns} data={logdata} />
                            </div>
                        </div>
                }
            </div>
            <div className="flex flex-col gap-4 py-6 px-4 col-span-3">
                {
                    !isMounted ?
                        <>
                            <Skeleton className="h-[185px] w-full" />
                            <Skeleton className="h-[185px] w-full" />
                            <Skeleton className="h-[185px] w-full" />
                        </>
                        :
                        <><div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#e0f0ff]'} p-4 rounded-lg`}>
                            <div className="flex flex-col space-y-4 w-full">
                                <div className="flex flex-row items-center justify-between">
                                    <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                        Daily Visitors
                                    </div>
                                    <div onClick={() => router.push('/request')} className="flex flex-row items-center text-xs poppins-extrabold text-gray-500 cursor-pointer hover:scale-105">
                                        <ChevronRight className="h-3 w-3" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                    <div className="flex flex-row item-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <div className="poppins-extrabold text-2xl text-black">
                                                {visitor}
                                            </div>
                                            <div className="poppins-semibold text-xs text-gray-500">
                                                The number of Visitors
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <CustomProgress className="h-3 [&>*]:bg-[#327be9]" value={totalVisitor()} />
                                    </div>
                                </div>
                            </div>
                        </div>
                            <div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#e0f0ff]'} p-4 rounded-lg`}>
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Active Users
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                        <div className="flex flex-row item-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <div className="poppins-extrabold text-2xl text-black">
                                                    {activeUsers.length}
                                                </div>
                                                <div className="poppins-semibold text-xs text-gray-500">
                                                    The number of active Users
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Activity className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <CustomProgress1 className="h-3 [&>*]:bg-[#327be9]" value={totalActiveUser()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#e0f0ff]'} p-4 rounded-lg`}>
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Time In/Out Rate
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                        <div className="flex flex-row item-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <div className="poppins-extrabold text-2xl text-black">
                                                    {Number.isNaN(totalTimeInTimeOutRate()) ? '0' : totalTimeInTimeOutRate().toFixed(2)}%
                                                </div>
                                                <div className="poppins-semibold text-[11px] text-gray-500">
                                                    % of successful time-in and time-out
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock3 className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Progress className="h-3 [&>*]:bg-[#327be9]" value={totalTimeInTimeOutRate()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </div>
        </div>
    )
}

export default ChildDashboard;