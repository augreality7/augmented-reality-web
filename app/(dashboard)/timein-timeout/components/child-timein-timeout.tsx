"use client";

import { useEffect, useState } from "react";
import CameraColumn from "./camera-column";
import TableColumn from "./table-column";
import { Logs } from "./column";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase";
import useMount from "@/hook/use-mount";
import { Skeleton } from "@/components/ui/skeleton";


const ChildTimeInTimeOut = () => {
    const { isMounted } = useMount();
    const [data, setData] = useState<Logs[]>([]);

    useEffect(() => {
        const logsRef = ref(database, 'logs');

        const fetchData = (snapshot: any) => {
            const logsData = snapshot.val();
            if (logsData) {
                const logsArray: Logs[] = [];

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
                });

                setData(logsArray);
            }
        };

        onValue(logsRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(logsRef, fetchData);
        };
    }, []);

    return (
        <div className="lg:grid lg:grid-cols-12 h-[85vh]">
            {
                !isMounted ?
                    <div className="col-span-6 flex justify-center items-center h-full relative">
                        <Skeleton className="h-[480px] w-[640px]" />
                    </div>
                    :
                    <CameraColumn />
            }
            {
                !isMounted ?
                    <div className="col-span-6 flex justify-center relative mt-8">
                        <Skeleton className="w-[90%]" />
                    </div>
                    :
                    <TableColumn data={data} />
            }
        </div>
    );
}

export default ChildTimeInTimeOut;