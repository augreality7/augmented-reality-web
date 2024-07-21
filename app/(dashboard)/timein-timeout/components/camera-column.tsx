"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { get, ref, set, update } from "firebase/database";
import { database } from "@/firebase";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { format, isSameDay, parse } from "date-fns";
import { v4 as uuidv4 } from "uuid";


const CameraColumn = () => {

    const { theme } = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(10); // Initial cooldown time

    let cooldownInterval: NodeJS.Timeout | number;
    let isProcessing = false; // Flag to control processing state

    useEffect(() => {
        startVideo();
        loadModels();
    }, []);

    function generateShortUUID() {
        return uuidv4().replace(/-/g, '').substring(0, 11);
    }

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(currentStream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                } else {
                    console.error("Video reference is not yet available.");
                }
            })
            .catch(error => {
                console.error("Error accessing video stream:", error);
            });
    };

    const loadModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
            ]);
            detectMyFace();
        } catch (error) {
            console.error("Failed to load models:", error);
        }
    };

    const detectMyFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const videoElement = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            console.error("Canvas context is not available.");
            return;
        }

        let intervalId: NodeJS.Timeout | null = null; // Variable to hold interval ID

        const detectAndProcess = async () => {
            try {
                // Clear previous drawings
                context.clearRect(0, 0, 640, 480);

                // Detect faces
                const detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks();

                if (detection && !isProcessing) {
                    // Set flag to true to prevent further detections until processing is done
                    isProcessing = true;
                    clearInterval(intervalId as NodeJS.Timeout);

                    // Resize and draw detection
                    const resizedDetection = faceapi.resizeResults(detection, { width: 640, height: 480 });
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

                    if (detection.detection.score > 0.8) {
                        setLoading(true);

                        // Capture snapshot
                        const snapshot = captureSnapshot(videoElement, detection);

                        if (snapshot) {
                            // Compare with Firebase stored images
                            const matched = await compareWithFirebaseImages(snapshot);

                            if (matched) {
                                toast.success("Match found, proceed now");
                                console.log(matched);
                                for (const [dataId, data] of Object.entries(matched)) {
                                    const { email } = data as any;

                                    // Check if there is data for this day
                                    const checkData = await get(ref(database, `logs/${dataId}`));

                                    let logForTodayFound = false;

                                    const today = new Date();

                                    if (checkData.exists()) {
                                        const logs = checkData.val();
                                        // Parse the dateCreated string to a Date object
                                        for (const [logId, logData] of Object.entries(logs)) {
                                            const { dateCreated, timeIn, timeOut } = logData as any;
                                            // Parse the dateCreated string to a Date object
                                            const parsedDateCreated = parse(dateCreated, 'MMMM dd, yyyy', new Date());

                                            if (isSameDay(today, parsedDateCreated)) {
                                                logForTodayFound = true;
                                                if (timeIn && timeOut) {
                                                    // If both timeIn and timeOut are set, create a new log entry for the same day
                                                    const newLogId = generateShortUUID();
                                                    await set(ref(database, `logs/${dataId}/${newLogId}`), {
                                                        email: email,
                                                        timeIn: format(Date.now(), 'MMMM dd, yyyy hh:mm aaa'),
                                                        timeOut: '',
                                                        dateCreated: format(Date.now(), 'MMMM dd, yyyy')
                                                    });
                                                    break;
                                                } else if (timeIn && !timeOut) {
                                                    // If timeIn exists but timeOut does not, update the timeOut
                                                    console.log("Updating timeOut");
                                                    await update(ref(database, `logs/${dataId}/${logId}`), {
                                                        timeOut: format(Date.now(), 'MMMM dd, yyyy hh:mm aaa')
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (!logForTodayFound && !checkData.exists()) {
                                        // If no data exists for today, create a new log
                                        await set(ref(database, `logs/${dataId}/${generateShortUUID()}`), {
                                            email: email,
                                            timeIn: format(Date.now(), 'MMMM dd, yyyy hh:mm aaa'),
                                            timeOut: '',
                                            dateCreated: format(Date.now(), 'MMMM dd, yyyy')
                                        });

                                        await set(ref(database, `visitors/${dataId}/${generateShortUUID()}`), {
                                            month: format(Date.now(), 'MMM'),
                                            year: format(Date.now(), 'yyyy'),
                                            dateCreated: format(Date.now(), 'MMMM dd, yyyy')
                                        });
                                    }
                                }

                                setLoading(false);
                                logTimeInOut();

                                // Show countdown overlay
                                setShowCountdown(true);

                                // Start countdown timer
                                await startCooldown();
                                setCooldownSeconds(10);

                                startDetection();
                                // Resume detection after processing
                            } else {
                                toast.error("No match found or align your face correctly");
                                setLoading(false);
                                isProcessing = false;

                                // Resume detection after processing
                                startDetection();
                            }
                        }
                    } else {
                        // No face detected with sufficient confidence
                        isProcessing = false;
                        startDetection();
                    }
                }
            } catch (error) {
                console.error("Error detecting faces:", error);
                isProcessing = false;
                startDetection();
            } finally {
                setLoading(false);
            }
        };

        // Function to start detection again
        const startDetection = () => {
            // Set flag back to false to resume detection
            isProcessing = false;
            // Setup interval to call detectAndProcess every second initially
            intervalId = setInterval(detectAndProcess, 1000);
        };

        // Initial setup: Start detecting faces
        startDetection();
    };


    const startCooldown = async () => {
        return new Promise<void>((resolve) => {
            cooldownInterval = setInterval(() => {
                setCooldownSeconds(prevSeconds => {
                    if (prevSeconds > 0) {
                        return prevSeconds - 1;
                    } else {
                        clearInterval(cooldownInterval as NodeJS.Timeout);
                        setShowCountdown(false); // Hide countdown overlay
                        resolve(); // Resolve the promise to indicate completion
                        return 0;
                    }
                });
            }, 1000);
        });
    };

    const captureSnapshot = (videoElement: HTMLVideoElement, detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return null;

        const { x, y, width, height } = detection.detection.box;
        canvas.width = width;
        canvas.height = height;

        context.drawImage(videoElement, x, y, width, height, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg');
    };

    const compareWithFirebaseImages = async (snapshot: string) => {
        const userRef = ref(database, `user`);
        try {
            const snapshotRef = await get(userRef);
            if (snapshotRef.exists()) {
                const registeredFaces = snapshotRef.val();
                const snapshotImage = await loadImage(snapshot);
                const snapshotDetection = await faceapi.detectSingleFace(snapshotImage).withFaceLandmarks().withFaceDescriptor();

                if (!snapshotDetection) {
                    console.log("No face detected in the snapshot.");
                    return false;
                }

                let bestMatch: { label: string, distance: number } | null = null;
                let bestMatchData: any = null;

                for (const faceId in registeredFaces) {
                    const imageUrl = registeredFaces[faceId].photoURL;
                    const registeredImage = await loadImage(imageUrl);
                    const registeredDetection = await faceapi.detectSingleFace(registeredImage).withFaceLandmarks().withFaceDescriptor();

                    if (!registeredDetection) {
                        console.log(`No face detected for user ${faceId}.`);
                        continue;
                    }

                    const faceMatcher = new faceapi.FaceMatcher([registeredDetection.descriptor]);
                    const match = faceMatcher.findBestMatch(snapshotDetection.descriptor);

                    if (match.label !== 'unknown' && match.distance < 0.6 && (!bestMatch || match.distance < bestMatch.distance)) {
                        bestMatch = match;
                        bestMatchData = { [faceId]: registeredFaces[faceId] };
                    }
                }

                if (bestMatch) {
                    console.log("Best match found:", bestMatch);
                    return bestMatchData;
                } else {
                    console.log("No suitable match found.");
                    return false;
                }
            } else {
                console.log("No registered faces found in Firebase.");
            }
        } catch (error) {
            console.error("Error fetching user data from Firebase:", error);
        }
        return false;
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    };

    const logTimeInOut = () => {
        console.log("Snapshot found match!");
    };

    return (
        <div className="col-span-6 flex justify-center items-center h-full relative">
            {loading && (
                <div className="absolute flex flex-col justify-center items-center h-[480px] w-[640px] rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
                    <div className={`h-20 w-20 rounded-full border-2 border-solid ${theme === 'dark' ? 'border-black' : 'border-white'} border-e-transparent animate-spin`} />
                </div>
            )}
            {showCountdown && (
                <div className="absolute flex flex-col justify-center items-center gap-4 h-[480px] w-[640px] bg-black rounded-lg">
                    <div className="text-white text-2xl font-bold">
                        Detect again in
                    </div>
                    <div className="text-white text-7xl font-bold">
                        {cooldownSeconds}
                    </div>
                </div>
            )}
            <video className="rounded-lg" crossOrigin="anonymous" ref={videoRef} autoPlay></video>
            <canvas height={480} width={640} className="absolute top-8 left-[22px]" ref={canvasRef}></canvas>
        </div>
    )
}

export default CameraColumn;