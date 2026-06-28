import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-xl w-full p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-[var(--color-foreground)] tracking-tight">Welcome back</h2>
                <p className="text-[var(--color-foreground-secondary)] text-sm mt-2">Log in to your HivonLabs dashboard</p>
            </div>

            <form className="space-y-4">
                {/* Placeholder for Google Auth (Backend Phase) */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[var(--color-border-subtle)] hover:bg-gray-50 rounded-lg text-sm font-medium text-[var(--color-foreground)] transition-colors"
                >
                    {/* Simple 'G' placeholder */}
                    <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full font-bold text-xs text-gray-700">G</div>
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 py-4">
                    <hr className="flex-1 border-[var(--color-border-subtle)]" />
                    <span className="text-xs font-semibold text-[var(--color-foreground-secondary)] uppercase tracking-wider">OR</span>
                    <hr className="flex-1 border-[var(--color-border-subtle)]" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-foreground)]">Email address</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        placeholder="admin@yourbusiness.com"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--color-foreground)]">Password</label>
                        <Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">Forgot password?</Link>
                    </div>
                    <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="button"
                    className="w-full py-3 mt-4 flex items-center justify-center gap-2 bg-[var(--color-foreground)] text-[var(--color-surface)] rounded-lg font-medium hover:bg-[var(--color-foreground-secondary)] transition-colors shadow-md"
                >
                    <LogIn size={18} />
                    Sign In
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-[var(--color-foreground-secondary)]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
                    Start your free trial
                </Link>
            </div>
        </div>
    );
}
