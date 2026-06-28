"use client";

import { motion } from "framer-motion";

interface StaggerContainerProps {
    children: React.ReactNode;
    staggerDelay?: number;
    delayChildren?: number;
    className?: string;
}

export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    delayChildren = 0,
    className = "",
}: StaggerContainerProps) {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delayChildren,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Helper wrapper for the generic item inside the StaggerContainer
interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" } as const
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}
