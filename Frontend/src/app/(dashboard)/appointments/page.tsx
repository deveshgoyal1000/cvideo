import { Search, Filter, MoreHorizontal, Download } from "lucide-react";

export default function AppointmentsPage() {
    const appointments = [
        { id: "APT-1042", customer: "Sarah Jenkins", service: "Balayage Color", duration: "1h 30m", date: "Oct 24, 2:00 PM", status: "CONFIRMED", bookingSource: "AI Engine" },
        { id: "APT-1043", customer: "Michael Chen", service: "Men's Cut", duration: "45m", date: "Oct 24, 3:30 PM", status: "PENDING", bookingSource: "AI Engine" },
        { id: "APT-1044", customer: "Emma Wilson", service: "Full Set Acrylics", duration: "1h", date: "Oct 25, 10:00 AM", status: "CONFIRMED", bookingSource: "Manual" },
        { id: "APT-1045", customer: "David Miller", service: "Deep Tissue Massage", duration: "1h", date: "Oct 25, 1:15 PM", status: "CANCELLED", bookingSource: "AI Engine" },
        { id: "APT-1046", customer: "Jessica Taylor", service: "Consultation", duration: "30m", date: "Oct 26, 9:00 AM", status: "COMPLETED", bookingSource: "Website" },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Appointments</h1>
                    <p className="text-[var(--color-foreground-secondary)] text-sm">View and manage your entire booking history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm overflow-hidden">

                {/* Table Toolbar */}
                <div className="p-4 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by customer or ID..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[var(--color-border-subtle)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--color-foreground-secondary)] uppercase bg-gray-50/50 border-b border-[var(--color-border-subtle)]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Appointment ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Service</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Source</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-[var(--color-foreground)]">{apt.id}</td>
                                    <td className="px-6 py-4 font-medium">{apt.customer}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-[var(--color-foreground)]">{apt.service}</div>
                                        <div className="text-xs text-[var(--color-foreground-secondary)]">{apt.duration}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{apt.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-foreground-secondary)]">{apt.bookingSource}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 text-gray-400 hover:text-[var(--color-foreground)] transition-colors rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-sm text-[var(--color-foreground-secondary)] bg-gray-50/30">
                    <span>Showing 1 to 5 of 42 entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-[var(--color-border-subtle)] rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 border border-[var(--color-border-subtle)] rounded-md bg-white hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
