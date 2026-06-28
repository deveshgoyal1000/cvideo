import Link from "next/link";
import { Zap } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { MobileMenu } from "@/components/MobileMenu";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
            {/* Premium Minimal Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-[var(--color-foreground)]">
                        <div className="bg-[var(--color-primary)] p-1 rounded-md text-[var(--color-surface)]">
                            <Zap size={20} />
                        </div>
                        TheSpinity
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-foreground-secondary)]">
                        <Link href="/features" className="hover:text-[var(--color-foreground)] transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-[var(--color-foreground)] transition-colors">Pricing</Link>
                        <Link href="/contact" className="hover:text-[var(--color-foreground)] transition-colors">Contact</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {/* Mobile Navigation */}
                        <MobileMenu />
                        
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <ModeToggle />
                            <Link
                                href="/login"
                                className="text-sm font-medium text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] transition-colors"
                            >
                                Log in
                            </Link>
                        </div>
                        <Link
                            href="/signup"
                            className="text-sm font-medium bg-[var(--color-foreground)] text-[var(--color-surface)] px-4 py-2 rounded-lg hover:bg-[var(--color-foreground-secondary)] transition-colors"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Professional Footer */}
            <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] py-12">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-[var(--color-foreground)] mb-4">
                            <Zap size={20} className="text-[var(--color-primary)]" />
                            TheSpinity
                        </Link>
                        <p className="text-sm text-[var(--color-foreground-secondary)] max-w-sm">
                            The fully customizable, AI-powered platform designed for creators. Curate trending AI news, generate engaging 30-60 second YouTube Shorts scripts, and easily synthesize them into high-quality human-like voiceovers.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-[var(--color-foreground-secondary)]">
                            <li><Link href="/features" className="hover:text-[var(--color-primary)] transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-[var(--color-primary)] transition-colors">Pricing</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-foreground)] mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-[var(--color-foreground-secondary)]">
                            <li><Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-12 pt-8 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row items-center justify-between text-sm text-[var(--color-foreground-secondary)]">
                    <p>© {new Date().getFullYear()} TheSpinity. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
