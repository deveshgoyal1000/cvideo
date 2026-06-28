"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Phone, Loader2, MicOff } from "lucide-react";
import { LiveAudioService } from "@/services/LiveAudioService";
import { VoiceWaveform } from "./animations/VoiceWaveform";

export function DemoCallInterface() {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [conversation, setConversation] = useState<{ id: string, role: 'user' | 'ai', content: string }[]>([]);
    const [hasStarted, setHasStarted] = useState(false);
    const [error, setError] = useState("");

    const audioServiceRef = useRef<LiveAudioService | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Keep chat pinned to bottom
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [conversation]);

    // Cleanup service on unmount
    useEffect(() => {
        return () => {
            if (audioServiceRef.current) {
                audioServiceRef.current.stop();
            }
        };
    }, []);

    const toggleCall = async () => {
        if (isActive) {
            audioServiceRef.current?.stop();
            setIsActive(false);
            setStatus("Disconnected");
        } else {
            setHasStarted(true);
            setError("");
            setConversation([]); // Clear previous chat for a fresh call
            try {
                // Initialize the official Gemini Live Audio Service
                const service = new LiveAudioService(
                    'Fenrir', // Fenrir is a male voice that fits the 'Rahul' persona perfectly
                    {
                        enthusiasm: 40,
                        calmness: 80,
                        formality: 70,
                        playfulness: 10,
                        empathy: 90,
                        pitch: 60
                    },
                    (text, isUser) => {
                        setConversation(prev => [
                            ...prev,
                            { id: Math.random().toString(36).substring(2), role: isUser ? 'user' : 'ai', content: text }
                        ]);
                    },
                    (newStatus) => {
                        setStatus(newStatus);

                        // Greet first when connected
                        if (newStatus === "Connected" && audioServiceRef.current) {
                            audioServiceRef.current.sendText("Please greet the customer as Rahul from Royal Style Hair Salon in Hindi now.");
                        }

                        // Reset button state on error or disconnect
                        if (newStatus.startsWith("Error") || newStatus === "Disconnected") {
                            if (newStatus.startsWith("Error")) {
                                setError(newStatus);
                            }
                            setIsActive(false);
                            if (audioServiceRef.current) {
                                audioServiceRef.current.stop();
                            }
                        }
                    }
                );
                audioServiceRef.current = service;
                await service.start();
                setIsActive(true);
            } catch (err: unknown) {
                console.error("Failed to start Live Audio Service:", err);
                const errorMessage = err instanceof Error ? err.message : "Failed to start call.";
                setError(errorMessage);
                setIsActive(false);
            }
        }
    };

    const isConnecting = status.includes("Connecting") || status.includes("Init");

    return (
        <div id="demo" className="mt-20 w-full max-w-4xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden flex flex-col" style={{ height: '600px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)] flex-shrink-0">
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-[var(--color-foreground)]">Elite Hair Salon — Virtual Receptionist</span>
                    <span className="text-sm text-[var(--color-foreground-secondary)] font-medium flex items-center gap-2">
                        <Phone size={14} />
                        {hasStarted ? "Interactive AI Live Voice Call" : "Click mic to start"}
                    </span>
                </div>
                {hasStarted && (
                    <span className={`text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-full ${status === 'Connected' ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                        {status === 'Connected' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                        {status}
                    </span>
                )}
            </div>

            {/* Chat Area */}
            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-white/5 relative">
                {!hasStarted ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
                            <Phone size={40} />
                        </div>
                        <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-3">Try the Voice AI Demo</h3>
                        <p className="text-[var(--color-foreground-secondary)] max-w-sm mb-2 text-base leading-relaxed">
                            Click the microphone and ask to book a haircut in Hindi or English! Speak naturally as if on a real phone call.
                        </p>
                    </div>
                ) : (
                    <>
                        {conversation.length === 0 && !error && status === 'Connected' && (
                            <div className="text-center text-[var(--color-foreground-secondary)] text-sm italic mt-10">
                                Call connected. Say hello!
                            </div>
                        )}
                        {conversation.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[var(--color-primary)] text-white rounded-tr-sm'
                                    : 'bg-white dark:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-foreground)] rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {error && (
                            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</div>
                        )}
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] flex flex-col items-center gap-4 flex-shrink-0 relative">
                {isActive && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                        <VoiceWaveform isActive={isActive} />
                    </div>
                )}
                
                <button
                    onClick={toggleCall}
                    disabled={isConnecting}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                        ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110'
                        : 'bg-[var(--color-primary)] text-white shadow-[0_10px_30px_rgba(0,102,204,0.3)] hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                        }`}
                >
                    {isConnecting ? <Loader2 size={32} className="animate-spin" /> :
                        isActive ? <MicOff size={32} className="animate-pulse" /> :
                            <Mic size={32} />}
                </button>
                <p className="text-sm font-medium text-[var(--color-foreground-secondary)]">
                    {!hasStarted ? 'Tap to start the demo call' :
                        isConnecting ? 'Connecting to Gemini Voice...' :
                            isActive ? '🎙️ Live conversational voice active — speak now' :
                                'Call disconnected. Tap to call again.'}
                </p>
            </div>
        </div>
    );
}
