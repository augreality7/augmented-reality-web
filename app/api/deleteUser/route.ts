import { database } from "@/firebase";
import { ref, remove } from "firebase/database";
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import axios from "axios";

async function fetchServiceAccount(url: string) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch service account JSON: ${error}`);
    }
}

async function initializeFirebaseAdmin() {

    const serviceAccountUrl = process.env.NEXT_PUBLIC_SERVICE_ACCOUNT;

    if (!serviceAccountUrl) {
        throw new Error('Service account URL is not defined in environment variables');
    }

    if (!admin.apps.length) {
        const serviceAccount = await fetchServiceAccount(serviceAccountUrl);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://augmentedreality-20623-default-rtdb.firebaseio.com"
        });
    }
}

export async function POST(
    req: Request,
) {

    await initializeFirebaseAdmin();

    const body = await req.json();
    const { id } = body;

    try {

        if (!id) {
            return NextResponse.json({ error: 'ID is required.' });
        }

        await remove(ref(database, `user/${id}`));

        await admin.auth().deleteUser(id);

        return NextResponse.json({ status: 200 });

    } catch (error) {
        console.log('USER', error);
        return NextResponse.json("Internal error", { status: 500 });
    }
}