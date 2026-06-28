"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, Volume2, Hash, PhoneCall } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const messages = [
    { id: 1, role: "ai", text: "Hi! Thanks for calling Elite Hair Salon. I'm your virtual assistant. How can I help you today?", duration: 4500 },
    { id: 2, role: "user", text: "Hi, do you have any openings for a haircut this afternoon?", duration: 3000 },
    { id: 3, role: "ai", text: "Oh, let me see... um, unfortunately we're completely booked this afternoon. But, actually, I do have a 10:00 AM or a 2:00 PM available tomorrow. Would either of those work?", duration: 6500 },
    { id: 4, role: "user", text: "2:00 PM tomorrow sounds perfect.", duration: 2500 },
    { id: 5, role: "ai", text: "Perfect! Just one moment while I secure that slot for you...", duration: 3500 },
    { id: 6, role: "ai", text: "Okay, you're all set! I've booked you in for 2:00 PM tomorrow. You'll get a confirmation text in a second. Is there anything else I can help with?", duration: 6000 },
    { id: 7, role: "system", text: "Appointment Confirmed by AI", duration: 3000 },
];

export function AnimatedTranscript() {
    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
    const [activeSpeaker, setActiveSpeaker] = useState<"ai" | "user" | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [callTime, setCallTime] = useState(0);
    const [loopKey, setLoopKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Call timer — resets on each loop
    useEffect(() => {
        if (!hasStarted) return;
        setCallTime(0);
        const timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [hasStarted, loopKey]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Message director — re-runs on each loop
    useEffect(() => {
        if (!hasStarted) return;

        let currentIdx = 0;
        let timeout: NodeJS.Timeout;

        const playNextTurn = () => {
            if (currentIdx >= messages.length) {
                setActiveSpeaker(null);
                // 30 second break, then restart
                timeout = setTimeout(() => {
                    setVisibleMessages([]);
                    setActiveSpeaker(null);
                    setLoopKey(k => k + 1);
                }, 30000);
                return;
            }

            const nextMessage = messages[currentIdx];
            
            setVisibleMessages((prev) => [...prev, nextMessage.id]);
            
            if (nextMessage.role === "ai" || nextMessage.role === "user") {
                 setActiveSpeaker(nextMessage.role as "ai" | "user");
            } else {
                 setActiveSpeaker(null);
            }

            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 50);

            timeout = setTimeout(() => {
                setActiveSpeaker(null);
                currentIdx++;
                timeout = setTimeout(playNextTurn, 600);
            }, nextMessage.duration);
        };

        timeout = setTimeout(playNextTurn, 1000);

        return () => clearTimeout(timeout);
    }, [hasStarted, loopKey, messages]);

    // Intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted]);

    return (
        <div ref={containerRef} className="w-full relative rounded-[2.5rem] bg-gray-950 overflow-hidden shadow-2xl border-4 border-gray-800 h-[650px] flex flex-col items-center">
            {/* Top notch simulation */}
            <div className="absolute top-0 w-[40%] h-6 bg-gray-800 rounded-b-2xl z-20"></div>

            {/* Glowing background behind avatar */}
            <motion.div 
                className="absolute top-[15%] w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"
                animate={{
                    scale: activeSpeaker === "ai" ? [1, 1.2, 1] : 1,
                    opacity: activeSpeaker === "ai" ? [0.4, 0.8, 0.4] : 0.2
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Header / Avatar */}
            <div className="pt-10 pb-2 flex flex-col items-center z-10 w-full mb-2">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Incoming Call...</p>
                <div className="relative">
                    <motion.div 
                        className="w-20 h-20 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white relative z-10"
                        animate={{
                            scale: activeSpeaker === "ai" ? [1, 1.04, 1] : 1,
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <PhoneCall size={28} className="text-white drop-shadow" />
                    </motion.div>

                    {/* Speaking animation rings — always rendered, opacity controlled */}
                    {[1.6, 2.0, 2.4].map((scale, i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border border-blue-400/60 pointer-events-none"
                            animate={activeSpeaker === "ai"
                                ? { opacity: [0, 0.6, 0], scale: [1, scale, scale] }
                                : { opacity: 0, scale: 1 }
                            }
                            transition={{
                                duration: 2,
                                delay: i * 0.5,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop",
                            }}
                        />
                    ))}
                </div>
                
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mt-4 tracking-tight">HivonLabs</h3>
                <p className="text-blue-400/80 text-xs font-semibold tracking-[0.25em] uppercase mb-1">AI Receptionist</p>
                <p className="text-gray-500 text-sm font-mono tracking-widest">{formatTime(callTime)}</p>
            </div>

            {/* Subtitles / Closed Captions */}
            <div className="flex-1 w-full relative overflow-hidden min-h-0">
                {/* Mask for fading out top messages */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-950 via-gray-950/80 to-transparent z-10 pointer-events-none" />
                
                <div ref={scrollRef} className="h-full overflow-y-auto px-6 pb-4 pt-12 scroll-smooth space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-500">
                    <AnimatePresence initial={false}>
                        {visibleMessages.map((id) => {
                            const msg = messages.find(m => m.id === id)!;
                            
                            if (msg.role === "system") {
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-green-400 text-sm font-semibold tracking-wide py-2 flex items-center justify-center gap-2"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                                        {msg.text}
                                    </motion.div>
                                );
                            }

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-[15px] leading-relaxed flex flex-col gap-1 ${
                                        msg.role === "user" ? "text-gray-300 items-end" : "text-white items-start"
                                    }`}
                                >
                                    <span className="text-xs uppercase font-bold tracking-widest opacity-40">
                                        {msg.role === "ai" ? "AI Receptionist" : "Caller"}
                                    </span>
                                    <p className={`max-w-[85%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                        "{msg.text}"
                                    </p>
                                    
                                    {/* Show user speaking waveform directly under user text */}
                                    {activeSpeaker === "user" && msg.id === visibleMessages[visibleMessages.length - 1] && (
                                        <div className="flex items-center gap-[2px] h-3 mt-1 text-blue-400">
                                            {[1,2,3,4].map(i => (
                                                <motion.div key={i} className="w-[3px] bg-current rounded-full"
                                                    animate={{ height: ["40%", "100%", "40%"] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Phone Call Controls - In normal flex flow, always at the bottom */}
            <div className="w-full flex-shrink-0 px-10 pb-8 pt-4">
                <div className="grid grid-cols-3 gap-y-4 gap-x-4 place-items-center">
                    <div className="flex flex-col items-center gap-2">
                        <button className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                            <Mic size={24} />
                        </button>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">mute</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <button className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                            <Hash size={24} />
                        </button>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">keypad</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <button className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                            <Volume2 size={24} />
                        </button>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">speaker</span>
                    </div>
                    <div className="col-span-3 mt-2">
                         <button className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 flex items-center justify-center text-white transition-colors cursor-pointer group">
                             <PhoneOff size={28} className="translate-y-[1px] group-hover:scale-110 transition-transform" />
                         </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
