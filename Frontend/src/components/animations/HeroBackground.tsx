"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Base background */}
            <div className="absolute inset-0 bg-[var(--color-background)]" />

            {/* Large Blue Blob - top left */}
            <motion.div
                className="absolute -top-60 -left-60 w-[900px] h-[900px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(99,102,241,0.35) 40%, transparent 70%)",
                    filter: "blur(80px)",
                }}
                animate={{ x: [0, 80, -30, 0], y: [0, -60, 40, 0], scale: [1, 1.1, 0.95, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Purple/Pink Blob - top right */}
            <motion.div
                className="absolute -top-40 right-[-300px] w-[800px] h-[800px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.3) 40%, transparent 70%)",
                    filter: "blur(80px)",
                }}
                animate={{ x: [0, -60, 40, 0], y: [0, 80, -30, 0], scale: [1, 0.9, 1.1, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />

            {/* Cyan Blob - center */}
            <motion.div
                className="absolute top-[30%] left-[25%] w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(59,130,246,0.25) 40%, transparent 70%)",
                    filter: "blur(100px)",
                }}
                animate={{ x: [0, 50, -40, 0], y: [0, -60, 30, 0], scale: [1, 1.2, 0.9, 1] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            />

            {/* Subtle dot grid */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

            {/* Bottom mask to blend into content */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
        </div>
    );
}
