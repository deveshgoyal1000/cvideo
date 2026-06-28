export default function ContactPage() {
    return (
        <div className="flex flex-col pt-16">
            <section className="py-24 px-6 bg-[var(--color-surface)] text-center">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">
                        Have questions about enterprise deployment, custom integrations, or our technology? We are here to help.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6 bg-[var(--color-background)]">
                <div className="container mx-auto max-w-2xl">
                    <form className="bg-[var(--color-surface)] p-8 md:p-12 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-foreground)]">First Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-foreground)]">Last Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">Work Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" placeholder="john@company.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">Message</label>
                            <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none" placeholder="How can we help you?" />
                        </div>

                        <button type="button" className="w-full py-4 bg-[var(--color-foreground)] text-[var(--color-surface)] rounded-xl font-medium hover:bg-[var(--color-foreground-secondary)] transition-colors shadow-md">
                            Send Message
                        </button>

                    </form>
                </div>
            </section>
        </div>
    );
}
