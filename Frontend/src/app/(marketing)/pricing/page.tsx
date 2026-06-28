import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="flex flex-col pt-16">
            <section className="py-24 px-6 bg-[var(--color-surface)] text-center">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">
                        Choose the plan that fits your business volume. No hidden fees or surprise charges.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6 bg-[var(--color-background)]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8 items-start">

                        {/* Starter Plan */}
                        <div className="p-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)]">
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">Starter</h3>
                            <p className="text-[var(--color-foreground-secondary)] text-sm mb-6">For small businesses starting out.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-foreground)]">$49</span>
                                <span className="text-[var(--color-foreground-secondary)]">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {['500 minutes included', '1 Calendar Integration', 'Standard English Support', 'Email Support'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-foreground-secondary)]">
                                        <Check size={16} className="text-[var(--color-primary)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup?plan=starter" className="block w-full py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] rounded-lg text-center font-medium hover:bg-gray-50 transition-colors">
                                Start Trial
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-primary)] shadow-xl relative scale-105">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase py-1 px-3 rounded-full">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">Pro</h3>
                            <p className="text-[var(--color-foreground-secondary)] text-sm mb-6">For growing clinics and salons.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-foreground)]">$149</span>
                                <span className="text-[var(--color-foreground-secondary)]">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {['2000 minutes included', 'Up to 5 Calendars', 'Hindi & English Support', 'Full Analytics Dashboard', 'Priority Support'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-foreground-secondary)]">
                                        <Check size={16} className="text-[var(--color-primary)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup?plan=pro" className="block w-full py-3 px-4 bg-[var(--color-primary)] text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-md">
                                Start Trial
                            </Link>
                        </div>

                        {/* Business Plan */}
                        <div className="p-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)]">
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">Business</h3>
                            <p className="text-[var(--color-foreground-secondary)] text-sm mb-6">For high-volume operations.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-foreground)]">$399</span>
                                <span className="text-[var(--color-foreground-secondary)]">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {['Unlimited minutes', 'Unlimited Calendars', 'Advanced CRM Integrations', 'Custom Voice Personas', '24/7 Phone Support'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-foreground-secondary)]">
                                        <Check size={16} className="text-[var(--color-primary)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact" className="block w-full py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] rounded-lg text-center font-medium hover:bg-gray-50 transition-colors">
                                Contact Sales
                            </Link>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
