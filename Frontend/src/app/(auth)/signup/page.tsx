import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-xl w-full p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-[var(--color-foreground)] tracking-tight">Create your account</h2>
                <p className="text-[var(--color-foreground-secondary)] text-sm mt-2">Start your 14-day free trial. No credit card required.</p>
            </div>

            <form className="space-y-4">
                {/* Placeholder for Google Auth */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[var(--color-border-subtle)] hover:bg-gray-50 rounded-lg text-sm font-medium text-[var(--color-foreground)] transition-colors"
                >
                    <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full font-bold text-xs text-gray-700">G</div>
                    Sign up with Google
                </button>

                <div className="flex items-center gap-4 py-4">
                    <hr className="flex-1 border-[var(--color-border-subtle)]" />
                    <span className="text-xs font-semibold text-[var(--color-foreground-secondary)] uppercase tracking-wider">OR</span>
                    <hr className="flex-1 border-[var(--color-border-subtle)]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-foreground)]">First Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                            placeholder="John"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-foreground)]">Last Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-foreground)]">Work Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        placeholder="john@company.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-foreground)]">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <Link
                    href="/onboarding"
                    className="w-full py-3 mt-4 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                    <UserPlus size={18} />
                    Create Account
                </Link>
            </form>

            <div className="mt-8 text-center text-sm text-[var(--color-foreground-secondary)]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}
