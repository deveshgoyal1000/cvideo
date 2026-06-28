import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function CalendarPage() {
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Calendar</h1>
                    <p className="text-[var(--color-foreground-secondary)] text-sm">Manage your availability and view upcoming bookings.</p>
                </div>
                <button className="flex items-center gap-2 bg-[var(--color-foreground)] text-[var(--color-surface)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-foreground-secondary)] transition-colors">
                    <Plus size={16} />
                    New Appointment
                </button>
            </div>

            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[600px]">
                {/* Calendar Header */}
                <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">October 24, 2026</h2>
                        <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[var(--color-border-subtle)] rounded-md shadow-sm">
                            <button className="p-1 hover:bg-gray-100 rounded-l-md transition-colors"><ChevronLeft size={20} className="text-gray-500" /></button>
                            <span className="px-3 text-sm font-medium border-x border-[var(--color-border-subtle)] py-1">Today</span>
                            <button className="p-1 hover:bg-gray-100 rounded-r-md transition-colors"><ChevronRight size={20} className="text-gray-500" /></button>
                        </div>
                    </div>
                    <div className="flex bg-[#FFFFFF] border border-[var(--color-border-subtle)] rounded-md shadow-sm overflow-hidden text-sm font-medium">
                        <button className="px-4 py-1.5 bg-gray-100 text-[var(--color-foreground)]">Day</button>
                        <button className="px-4 py-1.5 text-[var(--color-foreground-secondary)] hover:bg-gray-50 border-l border-[var(--color-border-subtle)]">Week</button>
                        <button className="px-4 py-1.5 text-[var(--color-foreground-secondary)] hover:bg-gray-50 border-l border-[var(--color-border-subtle)] hidden sm:block">Month</button>
                    </div>
                </div>

                {/* Day View Grid */}
                <div className="flex-1 overflow-y-auto relative bg-[var(--color-surface)]">
                    <div className="flex">
                        {/* Time Column */}
                        <div className="w-20 flex-shrink-0 border-r border-[var(--color-border-subtle)] bg-gray-50/30">
                            {hours.map(hour => (
                                <div key={hour} className="h-20 border-b border-[var(--color-border-subtle)] relative">
                                    <span className="absolute -top-3 right-3 text-xs text-[var(--color-foreground-secondary)] font-medium">
                                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Events Area */}
                        <div className="flex-1 relative min-w-[500px]">
                            {hours.map(hour => (
                                <div key={hour} className="h-20 border-b border-[var(--color-border-subtle)] w-full"></div>
                            ))}

                            {/* Sample Event 1 */}
                            <div className="absolute top-[80px] left-4 right-4 h-[60px] bg-blue-50 border-l-4 border-[var(--color-primary)] rounded-r-md p-2 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                <p className="text-xs font-bold text-[var(--color-primary)]">09:00 AM - 09:45 AM</p>
                                <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">Sarah Jenkins - Hair Coloring</p>
                            </div>

                            {/* Sample Event 2 */}
                            <div className="absolute top-[280px] left-4 right-4 h-[40px] bg-green-50 border-l-4 border-[var(--color-secondary)] rounded-r-md p-2 shadow-sm py-1 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                <p className="text-sm font-semibold text-green-800 truncate">11:30 AM - Michael Chen - Men&apos;s Cut</p>
                            </div>

                            {/* Current Time Indicator */}
                            <div className="absolute top-[200px] left-0 right-0 h-px bg-red-400 z-10 pointer-events-none">
                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
