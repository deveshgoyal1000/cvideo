"use client";

import { motion } from "framer-motion";

export function VoiceWaveform({ isActive }: { isActive: boolean }) {
    const bars = Array.from({ length: 14 });

    return (
        <div className="flex items-center justify-center gap-[3px] h-8 w-16">
            {bars.map((_, i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-blue-600 to-indigo-400"
                    animate={{
                        height: isActive 
                            ? [8, Math.random() * 24 + 8, 8] 
                            : 4,
                        opacity: isActive ? 1 : 0.3
                    }}
                    transition={{
                        duration: 0.4 + Math.random() * 0.4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.03
                    }}
                />
            ))}
        </div>
    );
}
