"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function OnboardingWizard() {
    const [step, setStep] = useState(1);

    const steps = [
        { title: "Business Details", desc: "Basic info" },
        { title: "Operating Hours", desc: "When are you open?" },
        { title: "Services", desc: "What do you offer?" },
        { title: "Calendar Sync", desc: "Connect bookings" },
    ];

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-xl w-full max-w-[600px] overflow-hidden">

            {/* Header & Progress */}
            <div className="bg-[var(--color-background)] px-8 py-6 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Account Setup</h2>
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--color-border-subtle)] -z-10 -translate-y-1/2" />
                    {steps.map((s, idx) => {
                        const isActive = step >= idx + 1;
                        const isCompleted = step > idx + 1;
                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${isCompleted ? 'bg-[var(--color-secondary)] border-[var(--color-secondary)] text-white' :
                                        isActive ? 'bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-primary)]' :
                                            'bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-foreground-secondary)]'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Form Content */}
            <div className="p-8 min-h-[300px]">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl font-semibold mb-6">Tell us about your business</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">Business Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="Luxe Salon & Spa" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">Industry</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                                <option>Clinic / Healthcare</option>
                                <option>Salon / Beauty</option>
                                <option>Coaching / Consulting</option>
                                <option>Other Services</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl font-semibold mb-6">When do you take calls?</h3>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                            <div key={day} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium">{day}</div>
                                <input type="time" defaultValue="09:00" className="px-3 py-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-background)]" />
                                <span className="text-sm text-[var(--color-foreground-secondary)]">to</span>
                                <input type="time" defaultValue="17:00" className="px-3 py-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-background)]" />
                            </div>
                        ))}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl font-semibold mb-6">What services do you offer?</h3>
                        <p className="text-sm text-[var(--color-foreground-secondary)] mb-4">Add the services you want the AI to book for your customers.</p>
                        <div className="flex gap-2 mb-4">
                            <input type="text" className="flex-1 px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)]" placeholder="e.g., General Consultation (30 min)" />
                            <button className="px-4 py-2 bg-[var(--color-foreground)] text-[var(--color-surface)] rounded-lg font-medium">Add</button>
                        </div>
                        <div className="p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border-subtle)] text-sm text-[var(--color-foreground-secondary)] text-center">
                            No services added yet.
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Connect Your Calendar</h3>
                        <p className="text-sm text-[var(--color-foreground-secondary)] mb-6 max-w-sm mx-auto">
                            Our Booking Engine needs to read your availability and write appointments. Your data is strictly protected.
                        </p>
                        <button className="w-full py-4 border border-[var(--color-border-subtle)] rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-medium">
                            <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full font-bold text-xs text-gray-700">G</div>
                            Connect Google Calendar
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] flex justify-between">
                <button
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${step === 1 ? 'invisible' : 'text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)]'}`}
                >
                    Back
                </button>
                {step < 4 ? (
                    <button
                        onClick={() => setStep(s => Math.min(4, s + 1))}
                        className="px-6 py-2 rounded-lg font-medium text-sm bg-[var(--color-foreground)] text-[var(--color-surface)] shadow-md hover:bg-[var(--color-foreground-secondary)] transition-colors"
                    >
                        Continue
                    </button>
                ) : (
                    <Link
                        href="/overview"
                        className="px-6 py-2 rounded-lg font-medium text-sm bg-[var(--color-primary)] text-white shadow-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        Complete Setup
                        <ArrowRight size={16} />
                    </Link>
                )}
            </div>

        </div>
    );
}
