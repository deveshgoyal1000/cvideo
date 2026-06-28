import { ModeToggle } from "@/components/ModeToggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-[var(--color-background)] to-[var(--color-background)] transition-colors">

            <div className="absolute top-6 right-6">
                <ModeToggle />
            </div>

            {/* Subtle branding outside the card */}
            <div className="mb-8 flex flex-col items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">HivonLabs</h1>
                <p className="text-sm text-[var(--color-foreground-secondary)]">The Next Generation Voice Receptionist</p>
            </div>

            <div className="w-full max-w-[440px]">
                {children}
            </div>

            <div className="mt-8 text-center text-sm text-[var(--color-foreground-secondary)] max-w-sm">
                By continuing, you agree to HivonLabs&apos; Terms of Service and Privacy Policy.
            </div>
        </div>
    );
}
