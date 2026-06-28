"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center gap-4">
            <ModeToggle />
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors p-2"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-[var(--color-background)] border-b border-[var(--color-border-subtle)] shadow-lg animate-in slide-in-from-top-2 p-6 flex flex-col gap-6">
                    <nav className="flex flex-col gap-4 text-base font-medium text-[var(--color-foreground)]">
                        <Link 
                            href="/features" 
                            className="hover:text-[var(--color-primary)] transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </Link>
                        <Link 
                            href="/pricing" 
                            className="hover:text-[var(--color-primary)] transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link 
                            href="/contact" 
                            className="hover:text-[var(--color-primary)] transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                    </nav>
                    
                    <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-col gap-4">
                        <Link
                            href="/login"
                            className="text-base font-medium text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] transition-colors text-center py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-base font-medium bg-[var(--color-foreground)] text-[var(--color-surface)] px-4 py-3 rounded-lg hover:bg-[var(--color-foreground-secondary)] transition-colors text-center"
                            onClick={() => setIsOpen(false)}
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
