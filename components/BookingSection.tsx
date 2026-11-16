'use client';

import { useState } from 'react';

export default function BookingSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', cityZip: '', preferredDateTime: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parts = form.name.trim().split(/\s+/);
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0] || form.name,
          lastName: parts.slice(1).join(' '),
          name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.cityZip,
          cityZip: form.cityZip,
          preferredDateTime: form.preferredDateTime,
          leadSource: 'booking-form',
          selectedStone: 'Consultation',
          projectType: 'In-Home or Showroom Estimate',
          estimatedRange: 'To be confirmed after consultation',
          callMeIn30Seconds: true,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      alert('There was an issue submitting your request. Please call (772) 299-7560.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="booking" className="py-24 bg-slate relative border-b border-gold/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-obsidian border border-gold/40 p-8 sm:p-12 shadow-2xl relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gold/20 pb-6 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Priority Service Line</span>
              <h2 className="font-serif text-3xl font-bold text-alabaster">Book In-Home or Showroom Estimate</h2>
            </div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-gold/10 border border-gold/40 text-gold rounded-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider">30-Sec Instant AI Call & SMS Confirmation</span>
            </div>
          </div>

          {!done ? (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-alabaster/70 mb-2">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Eleanor Vance" className="w-full p-3.5 bg-slate/40 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-alabaster/70 mb-2">Phone Number (For Instant SMS) *</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(772) 555-0199" className="w-full p-3.5 bg-slate/40 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-alabaster/70 mb-2">Email Address *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full p-3.5 bg-slate/40 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-alabaster/70 mb-2">City / Zip Code (Treasure Coast) *</label>
                  <input required value={form.cityZip} onChange={e => setForm({ ...form, cityZip: e.target.value })} placeholder="Vero Beach, 32963" className="w-full p-3.5 bg-slate/40 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-alabaster/70 mb-2">Preferred Estimate Date & Time</label>
                <input type="datetime-local" value={form.preferredDateTime} onChange={e => setForm({ ...form, preferredDateTime: e.target.value })} className="w-full p-3.5 bg-slate/40 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" />
              </div>
              <button disabled={submitting} type="submit" className="w-full py-4 bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-gold/20 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Dispatch Estimator & Get Instant Confirmation'}
              </button>
              <p className="text-[10px] text-center text-alabaster/40">By submitting, you agree to receive automated project updates via SMS from Stones of Italy, Inc.</p>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-gold text-2xl mb-3">Request Received</div>
              <p className="text-alabaster/80">Thank you! Our AI concierge/estimating team will follow up shortly to confirm your in-home or showroom estimate. If requested, you may receive a call and SMS confirmation soon.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
