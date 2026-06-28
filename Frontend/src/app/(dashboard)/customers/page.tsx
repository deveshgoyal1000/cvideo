import { Search, Mail, Phone, Clock, FileText } from "lucide-react";

export default function CustomersPage() {
    const customers = [
        { id: "C-101", name: "Sarah Jenkins", phone: "+1 (555) 123-4567", email: "sarah.j@example.com", lastVisit: "Oct 24, 2026", totalVisits: 14, status: "Active" },
        { id: "C-102", name: "Michael Chen", phone: "+1 (555) 987-6543", email: "m.chen@example.com", lastVisit: "Oct 18, 2026", totalVisits: 3, status: "Active" },
        { id: "C-103", name: "Emma Wilson", phone: "+1 (555) 456-7890", email: "emma.w@example.com", lastVisit: "Sep 02, 2026", totalVisits: 8, status: "Slipping Away" },
        { id: "C-104", name: "David Miller", phone: "+1 (555) 234-5678", email: "-", lastVisit: "Oct 25, 2026", totalVisits: 1, status: "New" }
    ];

    return (
        <div className="flex gap-6 h-[calc(100vh-8rem)]">

            {/* Customer List Column */}
            <div className="w-1/3 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm flex flex-col overflow-hidden min-w-[320px]">
                <div className="p-4 border-b border-[var(--color-border-subtle)] space-y-4">
                    <h2 className="text-lg font-bold text-[var(--color-foreground)]">Customers</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
                    {customers.map((c, i) => (
                        <button key={c.id} className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${i === 0 ? "bg-blue-50/50" : ""}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-[var(--color-foreground)]">{c.name}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    c.status === 'New' ? 'bg-blue-100 text-[var(--color-primary)]' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="text-sm text-[var(--color-foreground-secondary)]">{c.phone}</div>
                            <div className="text-xs text-gray-400 mt-2">Visits: {c.totalVisits} • Last: {c.lastVisit}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Detail Column */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm overflow-y-auto hidden md:block">

                {/* Profile Header */}
                <div className="p-8 border-b border-[var(--color-border-subtle)] bg-gray-50/30">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-[var(--color-primary)] text-[var(--color-surface)] rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                            SJ
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">Sarah Jenkins</h1>
                            <div className="flex items-center gap-4 text-sm text-[var(--color-foreground-secondary)] mb-4">
                                <div className="flex items-center gap-1.5"><Phone size={14} /> +1 (555) 123-4567</div>
                                <div className="flex items-center gap-1.5"><Mail size={14} /> sarah.j@example.com</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-lg text-sm font-medium hover:bg-gray-50">Edit Profile</button>
                                <button className="px-4 py-2 bg-[var(--color-foreground)] text-[var(--color-surface)] rounded-lg text-sm font-medium hover:bg-[var(--color-foreground-secondary)]">New Booking</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs Content */}
                <div className="p-8">
                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Call History & Notes</h3>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-border-subtle)] before:to-transparent">

                        {/* Timeline Item 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Phone size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-sm">Inbound Call</h4>
                                    <span className="text-xs text-gray-400">Oct 24, 1:45 PM</span>
                                </div>
                                <p className="text-sm text-[var(--color-foreground-secondary)]">Customer modified existing appointment to &quot;Balayage Color&quot; instead of standard highlight. Handled confidently by AI Engine.</p>
                                <span className="inline-block px-2 py-1 mt-2 bg-blue-50 text-[var(--color-primary)] text-[10px] font-bold uppercase rounded-md">Booking Updated</span>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <FileText size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--color-border-subtle)] bg-gray-50/50 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-sm">Staff Note</h4>
                                    <span className="text-xs text-gray-400">Sep 15, 4:20 PM</span>
                                </div>
                                <p className="text-sm text-[var(--color-foreground-secondary)]">Prefers senior stylist if possible. Sensitive scalp, use ammonia-free formulas.</p>
                            </div>
                        </div>

                        {/* Timeline Item 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Clock size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-sm">Completed Appointment</h4>
                                    <span className="text-xs text-gray-400">Sep 15, 2:00 PM</span>
                                </div>
                                <p className="text-sm text-[var(--color-foreground-secondary)]">Standard Haircut & Style - $85.00</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
