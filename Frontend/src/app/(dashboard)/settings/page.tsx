import { Save, Store, Clock, Mic, Bell, Shield, CalendarCheck } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Settings</h1>
                    <p className="text-[var(--color-foreground-secondary)] text-sm">Manage your business profile, operating hours, and AI Voice configuration.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Save size={16} />
                    Save Changes
                </button>
            </div>

            <div className="flex gap-8 relative max-md:flex-col">
                {/* Settings Navigation */}
                <div className="w-full md:w-56 flex-shrink-0 space-y-1">
                    {[
                        { id: "business", label: "Business Profile", icon: <Store size={18} /> },
                        { id: "hours", label: "Operating Hours", icon: <Clock size={18} /> },
                        { id: "voice", label: "AI Voice & Language", icon: <Mic size={18} /> },
                        { id: "calendar", label: "Calendar Sync", icon: <CalendarCheck size={18} /> },
                        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
                        { id: "security", label: "Security & Billing", icon: <Shield size={18} /> },
                    ].map((item, i) => (
                        <button key={item.id} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 0
                                ? "bg-blue-50 text-[var(--color-primary)]"
                                : "text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]"
                            }`}>
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content Pane */}
                <div className="flex-1 space-y-6">

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--color-border-subtle)]">
                            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">Business Profile</h2>
                            <p className="text-sm text-[var(--color-foreground-secondary)]">The public information the AI will use to answer customer questions.</p>
                        </div>
                        <div className="p-6 space-y-6">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-foreground)]">Business Name</label>
                                    <input type="text" className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm" defaultValue="Luxe Salon & Spa" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-foreground)]">Phone Number</label>
                                    <input type="text" className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm" defaultValue="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-foreground)]">Address</label>
                                <input type="text" className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm" defaultValue="123 Main Street, Suite 200, Metropolis, NY" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-foreground)]">Business Description (Used by AI for Context)</label>
                                <textarea rows={4} className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm resize-none" defaultValue="A premium hair salon and spa offering services like balayage, haircuts, deep tissue massage, and facials. We use only organic, cruelty-free products." />
                            </div>

                        </div>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">AI Voice Configuration</h2>
                                <p className="text-sm text-[var(--color-foreground-secondary)]">Customize how HivonLabs sounds to your customers.</p>
                            </div>
                            <div className="p-2 bg-blue-50 text-[var(--color-primary)] rounded-full">
                                <Mic size={20} />
                            </div>
                        </div>
                        <div className="p-6 space-y-6">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-foreground)]">Primary Language</label>
                                    <select className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm">
                                        <option>Bilingual (English & Hindi)</option>
                                        <option>English Only</option>
                                        <option>Hindi Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-foreground)]">Voice Persona</label>
                                    <select className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm">
                                        <option>Professional Female (Aria)</option>
                                        <option>Friendly Female (Maya)</option>
                                        <option>Professional Male (Liam)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-[var(--color-border-subtle)]">
                                <label className="text-sm font-medium text-[var(--color-foreground)]">Custom Greeting</label>
                                <input type="text" className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm" defaultValue="Thank you for calling Luxe Salon and Spa. I am your virtual assistant. How can I help you today?" />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
