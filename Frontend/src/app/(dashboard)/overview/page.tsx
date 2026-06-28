import { ArrowUpRight, Clock, PhoneCall, CalendarCheck, TrendingUp, LineChart } from "lucide-react";

export default function OverviewPage() {
    const metrics = [
        { title: "Calls Handled", value: "842", change: "+14%", isUp: true, icon: <PhoneCall size={20} /> },
        { title: "Appointments Booked", value: "314", change: "+22%", isUp: true, icon: <CalendarCheck size={20} /> },
        { title: "Missed Calls Recovered", value: "94", change: "+12%", isUp: true, icon: <Clock size={20} /> },
        { title: "Est. Revenue Impact", value: "$12,450", change: "+18%", isUp: true, icon: <TrendingUp size={20} /> },
    ];

    const recentAppointments = [
        { id: "A1", customer: "Sarah Jenkins", service: "Balayage Color", date: "Today, 2:00 PM", status: "CONFIRMED" },
        { id: "A2", customer: "Michael Chen", service: "Men's Cut", date: "Today, 3:30 PM", status: "PENDING" },
        { id: "A3", customer: "Emma Wilson", service: "Full Set Acrylics", date: "Tomorrow, 10:00 AM", status: "CONFIRMED" },
        { id: "A4", customer: "David Miller", service: "Deep Tissue Massage", date: "Tomorrow, 1:15 PM", status: "CONFIRMED" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Overview</h1>
                <p className="text-[var(--color-foreground-secondary)] text-sm">Here&apos;s what happened while HivonLabs managed the front desk.</p>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-[var(--color-foreground-secondary)]">{m.icon}</div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-[var(--color-secondary)]">
                                {m.change}
                                <ArrowUpRight size={14} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[var(--color-foreground-secondary)] text-sm font-medium">{m.title}</h3>
                            <p className="text-3xl font-bold text-[var(--color-foreground)] mt-1">{m.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CHART PLACEHOLDER */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-[var(--color-foreground)] mb-1">Call Volume vs Bookings</h3>
                    <p className="text-xs text-[var(--color-foreground-secondary)] mb-6">Last 30 days performance</p>

                    <div className="flex-1 bg-[var(--color-background)] rounded-xl border border-[var(--color-border-subtle)] border-dashed flex items-center justify-center text-[var(--color-foreground-secondary)] min-h-[300px]">
                        {/* Chart library will go here (e.g. Recharts or Chart.js) */}
                        <LineChart size={32} className="opacity-20" />
                        <span className="ml-3 font-medium text-sm text-gray-400">Chart Visualization Space</span>
                    </div>
                </div>

                {/* APPOINTMENTS LIST */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[var(--color-foreground)]">Upcoming</h3>
                        <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {recentAppointments.map(app => (
                            <div key={app.id} className="flex flex-col gap-1 p-3 hover:bg-[var(--color-background)] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border-subtle)]">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm text-[var(--color-foreground)]">{app.customer}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="text-xs text-[var(--color-foreground-secondary)]">{app.service}</div>
                                <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] mt-1">
                                    <Clock size={12} />
                                    {app.date}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
