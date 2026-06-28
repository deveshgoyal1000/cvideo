import { NextResponse } from "next/server";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "+16624395286";
const TO_NUMBER = process.env.TWILIO_TO_NUMBER || "+917597388556";
const BACKEND_URL = process.env.BACKEND_URL || "https://elle-unsatiating-sherwood.ngrok-free.dev";

export async function POST() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const twilio = require("twilio");
        const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
        const call = await client.calls.create({
            url: `${BACKEND_URL}/call/incoming`,
            to: TO_NUMBER,
            from: FROM_NUMBER,
        });
        return NextResponse.json({ success: true, callSid: call.sid });
    } catch (err: unknown) {
        console.error("Call error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
