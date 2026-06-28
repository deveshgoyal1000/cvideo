"use client";

import { motion } from "framer-motion";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    className?: string;
}

export function FadeIn({
    children,
    delay = 0,
    direction = "up",
    duration = 0.5,
    className = "",
}: FadeInProps) {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
        none: { x: 0, y: 0 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction],
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
            }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for a smooth "ease-out" feel
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
