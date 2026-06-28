"use client";

import { motion } from "framer-motion";

export function AnimatedTranscriptBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Primary slow-breathing background shape matching phone geometry */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-900/40 rounded-[2.5rem]"
                animate={{
                    scale: [1.01, 1.03, 1.01],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            
            {/* Intense pulsing glow layered on top to make it look "alive" */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-400/20 rounded-[2.5rem] blur-xl"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1.02, 1.06, 1.02],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
