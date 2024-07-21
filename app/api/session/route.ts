import { app } from "@/firebase";
import { getSession } from "@/lib/action";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const auth = getAuth(app);

    try {
        const body = await req.json();
        const { values } = body;

        const response = await signInWithEmailAndPassword(auth, values.email, values.password);

        if (response.user) {
            const id = response.user.uid;
            const session = await getSession();
            session.uid = response.user.uid;
            session.email = response.user.email || '';
            session.photoUrl = response.user.photoURL || '';
            session.isLoggedIn = true;
            await session.save();

            return NextResponse.json({ status: 200, id });
        } else {
            return NextResponse.json("Authentication failed", { status: 401 });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        return NextResponse.json("Internal error", { status: 500 });
    }
}
