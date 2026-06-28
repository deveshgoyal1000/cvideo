import { Calendar, Download, TrendingUp, TrendingDown, PhoneMissed, Clock } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Analytics</h1>
                    <p className="text-[var(--color-foreground-secondary)] text-sm">Deep insights into your call operations and booking health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border-subtle)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Calendar size={16} />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-foreground)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-foreground-secondary)] transition-colors">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Highlight Card 1 */}
                <div className="bg-[colvar(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm bg-blue-50/30">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground-secondary)]">Booking Conversion</h3>
                        <div className="p-2 bg-blue-100 text-[var(--color-primary)] rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">68.4%</div>
                    <p className="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1">
                        +5.2% from last month
                    </p>
                </div>

                {/* Highlight Card 2 */}
                <div className="bg-[colvar(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground-secondary)]">Calls Handled (Bot)</h3>
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                            <PhoneMissed size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">1,248</div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500" /> 24% human escalation rate
                    </p>
                </div>

                {/* Highlight Card 3 */}
                <div className="bg-[colvar(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground-secondary)]">Avg. Call Duration</h3>
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">1m 42s</div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <TrendingDown size={14} className="text-red-500" /> -12s from last month (faster booking)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Large Chart Area 1 */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm h-96 flex flex-col">
                    <h3 className="text-[var(--color-foreground)] font-bold mb-1">Peak Calling Hours</h3>
                    <p className="text-sm text-[var(--color-foreground-secondary)] mb-6">When do customers call the most?</p>
                    <div className="flex-1 bg-gray-50 rounded-xl border border-[var(--color-border-subtle)] border-dashed flex items-center justify-center text-gray-400 font-medium text-sm">
                        [ Bar Chart: Call Volume by Hour of Day ]
                    </div>
                </div>

                {/* Large Chart Area 2 */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-2xl shadow-sm h-96 flex flex-col">
                    <h3 className="text-[var(--color-foreground)] font-bold mb-1">Call Outcomes</h3>
                    <p className="text-sm text-[var(--color-foreground-secondary)] mb-6">Result of AI interactions.</p>
                    <div className="flex-1 bg-gray-50 rounded-xl border border-[var(--color-border-subtle)] border-dashed flex flex-col items-center justify-center text-gray-400 font-medium text-sm gap-4">
                        [ Donut Chart visualization ]
                        <ul className="text-xs space-y-2 mt-4">
                            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-[var(--color-primary)] rounded-full"></span> Booked (68%)</li>
                            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded-full"></span> General Query answered (18%)</li>
                            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-400 rounded-full"></span> Escalated to Human (14%)</li>
                        </ul>
                    </div>
                </div>

            </div>

        </div>
    );
}
