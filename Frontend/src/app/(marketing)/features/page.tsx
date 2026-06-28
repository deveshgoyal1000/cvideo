import { Check, ShieldCheck, Zap, LineChart, Users, PhoneCall } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="flex flex-col pt-16">
            <section className="py-24 px-6 bg-[var(--color-surface)] text-center">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] mb-6">
                        Everything your front desk needs, <span className="text-[var(--color-primary)]">automated.</span>
                    </h1>
                    <p className="text-xl text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">
                        HivonLabs brings enterprise-grade voice automation to scaling service businesses. Discover how our system reclaims your time.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6 bg-[var(--color-background)]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "24/7 Call Answering",
                                desc: "Never route a customer to voicemail again. We answer instantly, no matter the volume.",
                                icon: <PhoneCall size={24} className="text-[var(--color-primary)]" />
                            },
                            {
                                title: "Smart Booking Engine",
                                desc: "Seamlessly checks real-time availability and creates confirmed calendar events without double-booking.",
                                icon: <Zap size={24} className="text-[var(--color-primary)]" />
                            },
                            {
                                title: "Bilingual Intelligence",
                                desc: "Fluent in both Hindi and English, ensuring your customers are understood clearly and comfortably.",
                                icon: <Users size={24} className="text-[var(--color-primary)]" />
                            },
                            {
                                title: "Instant CRM Memory",
                                desc: "Recognizes returning customers, recalls their service history, and personalizes every interaction.",
                                icon: <ShieldCheck size={24} className="text-[var(--color-primary)]" />
                            },
                            {
                                title: "Analytics & Recovery",
                                desc: "Track call volumes, booking conversion rates, and automatically identify abandoned opportunities.",
                                icon: <LineChart size={24} className="text-[var(--color-primary)]" />
                            },
                            {
                                title: "Human Escalation",
                                desc: "Seamlessly routes complex queries or VIP customers to your staff with full context attached.",
                                icon: <Check size={24} className="text-[var(--color-primary)]" />
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">{feature.title}</h3>
                                <p className="text-[var(--color-foreground-secondary)] leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
