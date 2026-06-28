"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import {
    LayoutDashboard,
    Video,
    Film,
    Clock,
    Users,
    LineChart,
    Settings,
    Bell,
    Search,
    Zap
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/overview", icon: <LayoutDashboard size={20} /> },
        { name: "Shorts Generator", href: "/shorts", icon: <Video size={20} /> },
        { name: "Clip Search", href: "/clip-search", icon: <Film size={20} /> },
        { name: "Captions Editor", href: "/captions", icon: <Video size={20} /> },
        { name: "Analytics", href: "/analytics", icon: <LineChart size={20} /> },
        { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)]">
                    <Link href="/overview" className="flex items-center gap-2 font-bold text-lg text-[var(--color-foreground)] tracking-tight">
                        <div className="bg-[var(--color-primary)] p-1 rounded-md text-[var(--color-surface)]">
                            <Zap size={18} />
                        </div>
                        TheSpinity
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hover:-webkit-scrollbar transition-all">
                    <p className="px-2 text-xs font-semibold text-[var(--color-foreground-secondary)] uppercase tracking-wider mb-4">Workspace</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-blue-50 text-[var(--color-primary)]"
                                    : "text-[var(--color-foreground-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-surface)] flex items-center justify-center font-bold text-sm">
                            L
                        </div>
                        <div className="flexflex-col">
                            <span className="text-sm font-medium text-[var(--color-foreground)] block leading-tight">Creator Space</span>
                            <span className="text-xs text-[var(--color-foreground-secondary)]">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* TOP HEADER */}
                <header className="h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-secondary)]" />
                            <input
                                type="text"
                                placeholder="Search videos, scripts..."
                                className="w-full pl-10 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                            />
                        </div>
                        <span className="md:hidden font-bold">TheSpinity</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <button className="relative p-2 text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] transition-colors rounded-full hover:bg-[var(--color-background)]">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-surface)]" />
                        </button>
                        <div className="h-6 w-px bg-[var(--color-border-subtle)]"></div>
                        <span className="text-sm font-medium text-[var(--color-foreground)] hidden sm:block">Admin</span>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
                    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
