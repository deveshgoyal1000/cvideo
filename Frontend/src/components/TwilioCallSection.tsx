"use client";

import { useState } from "react";
import { Phone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type CallState = "idle" | "loading" | "success" | "error";

export function TwilioCallSection() {
    const [callState, setCallState] = useState<CallState>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleCall = async () => {
        setCallState("loading");
        setErrorMsg("");
        try {
            const res = await fetch("/api/call", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to place call");
            setCallState("success");
            setTimeout(() => setCallState("idle"), 6000);
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
            setCallState("error");
            setTimeout(() => setCallState("idle"), 5000);
        }
    };

    return (
        <section id="try-call" className="py-24 bg-[var(--color-background)] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
                {/* Label */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Live Demo — Real Phone Call
                </div>

                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-foreground)] mb-4">
                    Experience Rahul{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-400">
                        on your phone
                    </span>
                </h2>
                <p className="text-base md:text-lg text-[var(--color-foreground-secondary)] mb-12 max-w-xl mx-auto leading-relaxed">
                    Click the button and your phone will ring in seconds. Have a full conversation with our AI receptionist — just like a real customer would.
                </p>

                {/* Big call button */}
                <div className="flex flex-col items-center gap-6">
                    <button
                        id="twilio-call-btn"
                        onClick={handleCall}
                        disabled={callState === "loading" || callState === "success"}
                        className={`
                            group relative w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2
                            font-bold text-white text-base transition-all duration-300 shadow-2xl
                            ${callState === "idle" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-110 hover:shadow-blue-500/40 shadow-blue-500/30" 
                                : callState === "loading"
                                ? "bg-gradient-to-br from-blue-400 to-blue-600 scale-105 shadow-blue-500/30"
                                : callState === "success"
                                ? "bg-gradient-to-br from-green-400 to-green-600 scale-105 shadow-green-500/30"
                                : "bg-gradient-to-br from-red-400 to-red-600 scale-100"
                            }
                            disabled:cursor-not-allowed
                        `}
                    >
                        {/* Pulse rings when loading */}
                        {callState === "loading" && (
                            <>
                                <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
                                <span className="absolute inset-3 rounded-full bg-blue-300 opacity-20 animate-ping" style={{ animationDelay: "0.2s" }} />
                            </>
                        )}
                        {callState === "success" && (
                            <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
                        )}

                        {callState === "idle" && <Phone size={40} className="group-hover:scale-110 transition-transform" />}
                        {callState === "loading" && <Loader2 size={40} className="animate-spin" />}
                        {callState === "success" && <CheckCircle2 size={40} />}
                        {callState === "error" && <AlertCircle size={40} />}

                        <span className="text-sm font-semibold">
                            {callState === "idle" && "Call Me"}
                            {callState === "loading" && "Calling…"}
                            {callState === "success" && "Calling!"}
                            {callState === "error" && "Failed"}
                        </span>
                    </button>

                    {/* Status text */}
                    <p className="text-sm text-[var(--color-foreground-secondary)] min-h-[20px]">
                        {callState === "idle" && "Your phone will ring within a few seconds"}
                        {callState === "loading" && "Connecting Rahul to your phone…"}
                        {callState === "success" && "📞 Your phone is ringing — pick up and talk to Rahul!"}
                        {callState === "error" && (
                            <span className="text-red-500">{errorMsg}</span>
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}
