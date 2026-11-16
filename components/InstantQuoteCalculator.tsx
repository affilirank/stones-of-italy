'use client';

import { useEffect, useMemo, useState } from 'react';
import { TOP_10_STONES } from '@/lib/stones';
import { calculateQuote, formatCurrency, type ProjectScope, type EdgeProfile } from '@/lib/quote';

const PRESETS = [
  { label: 'Small ~30 sq ft', sqFt: 30 },
  { label: 'Medium ~50 sq ft', sqFt: 50 },
  { label: 'Large ~75 sq ft', sqFt: 75 },
  { label: 'Estate ~100+ sq ft', sqFt: 100 },
];

export default function InstantQuoteCalculator() {
  const [step, setStep] = useState(1);
  const [projectScope, setProjectScope] = useState<ProjectScope>('kitchen');
  const [squareFeet, setSquareFeet] = useState(50);
  const [stoneId, setStoneId] = useState(TOP_10_STONES[0].id);
  const [edgeProfile, setEdgeProfile] = useState<EdgeProfile>('eased');
  const [waterfallSides, setWaterfallSides] = useState(1);
  const [undermountSink, setUndermountSink] = useState(true);
  const [cooktop, setCooktop] = useState(false);
  const [tearOut, setTearOut] = useState(false);

  const [showGate, setShowGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [callMe, setCallMe] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', cityZip: '' });

  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.stoneId;
      if (id && TOP_10_STONES.some(s => s.id === id)) {
        setStoneId(id);
        setStep(3);
      }
    };
    window.addEventListener('soi:select-stone', handler);
    return () => window.removeEventListener('soi:select-stone', handler);
  }, []);

  const quote = useMemo(() => calculateQuote({
    projectScope,
    squareFeet,
    stoneId,
    edgeProfile,
    waterfallSides: edgeProfile === 'mitered_waterfall' ? waterfallSides : 0,
    undermountSinkCutouts: undermountSink ? 1 : 0,
    cooktopCutouts: cooktop ? 1 : 0,
    tearOutDisposal: tearOut,
  }), [projectScope, squareFeet, stoneId, edgeProfile, waterfallSides, undermountSink, cooktop, tearOut]);

  const selectedStone = TOP_10_STONES.find(s => s.id === stoneId)!;

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
          city: form.cityZip,
          selectedStone: quote.stoneName,
          stoneId,
          projectType: projectScope,
          projectScope,
          sqFt: squareFeet,
          estimatedRange: `${formatCurrency(quote.rangeLow)} – ${formatCurrency(quote.rangeHigh)} Installed`,
          quoteRangeLow: quote.rangeLow,
          quoteRangeHigh: quote.rangeHigh,
          leadSource: 'precision-estimator',
          callMeIn30Seconds: callMe,
          quote,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      setShowGate(false);
    } catch (err) {
      alert('There was an issue submitting your request. Please call (772) 299-7560 and we will assist immediately.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-panel-dark p-6 sm:p-10 border border-gold/30 shadow-2xl relative">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-widest text-gold font-bold">Precision Countertop Project Estimator</div>
        <div className="flex gap-2 text-[11px]">
          {[1,2,3,4].map(n => (
            <button key={n} type="button" onClick={() => setStep(n)} className={`w-7 h-7 rounded-full border ${step===n?'bg-gold text-obsidian border-gold':'border-gold/40 text-alabaster/70'}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {step === 1 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gold mb-3">Step 1: Project Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { v: 'kitchen', l: 'Kitchen' },
                { v: 'kitchen_island', l: 'Kitchen + Island' },
                { v: 'bath_vanity', l: 'Bathroom Vanity' },
                { v: 'outdoor_kitchen', l: 'Outdoor Summer Kitchen' },
                { v: 'fireplace_wrap', l: 'Fireplace Wrap' },
              ].map(o => (
                <button key={o.v} type="button" onClick={() => setProjectScope(o.v as ProjectScope)}
                  className={`p-3 text-center border text-xs font-semibold transition-all ${projectScope === o.v ? 'border-gold bg-gold/10' : 'border-gold/20 bg-slate/50 hover:border-gold/60'}`}>{o.l}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gold mb-3">Step 2: Approximate Size</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {PRESETS.map(p => (
                <button key={p.label} type="button" onClick={() => setSquareFeet(p.sqFt)}
                  className={`px-3 py-2 text-[11px] uppercase tracking-wider border ${squareFeet === p.sqFt ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-alabaster/70 hover:border-gold/50'}`}>{p.label}</button>
              ))}
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] uppercase tracking-wider text-alabaster/60">Fine-tune square footage</span>
              <span className="text-lg font-serif font-bold text-gold">{squareFeet} Sq. Ft.</span>
            </div>
            <input type="range" min={15} max={140} step={1} value={squareFeet} onChange={e => setSquareFeet(Number(e.target.value))} className="w-full h-2 bg-slate rounded-lg appearance-none cursor-pointer" />
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gold mb-3">Step 3: Select Stone (Top 10, realistic installed Vero Beach rates)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {TOP_10_STONES.map(s => (
                <button key={s.id} type="button" onClick={() => setStoneId(s.id)} className={`text-left p-3 border transition-all ${stoneId===s.id?'border-gold bg-gold/10':'border-gold/20 bg-slate/40 hover:border-gold/50'}`}>
                  <div className="flex justify-between gap-2"><span className="text-sm font-semibold text-alabaster">{s.name}</span><span className="text-xs text-gold whitespace-nowrap">${s.installedRateSqFt}/sq ft</span></div>
                  <div className="text-[10px] uppercase text-alabaster/60 mt-0.5">{s.type} {s.outdoorUvSafe ? '• Outdoor UV Safe' : ''}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-alabaster/50 mt-2">{selectedStone.description}</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gold">Step 4: Edge Profile & Cutouts</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-alabaster/70 mb-2 block">Edge Profile</label>
                <select value={edgeProfile} onChange={e => setEdgeProfile(e.target.value as EdgeProfile)} className="w-full p-3.5 bg-slate/60 border border-gold/30 text-alabaster text-sm focus:outline-none focus:border-gold">
                  <option value="eased">Eased (included)</option>
                  <option value="beveled">Beveled (included)</option>
                  <option value="bullnose">Bullnose (+$12/ln ft)</option>
                  <option value="ogee">Ogee (+$12/ln ft)</option>
                  <option value="mitered_waterfall">Mitered Waterfall Edge (+$450/side)</option>
                </select>
                {edgeProfile === 'mitered_waterfall' && (
                  <div className="mt-3">
                    <label className="text-[11px] uppercase tracking-wider text-alabaster/70">Waterfall sides</label>
                    <select value={waterfallSides} onChange={e => setWaterfallSides(Number(e.target.value))} className="mt-1 w-full p-2.5 bg-slate/60 border border-gold/30 text-sm">
                      <option value={1}>1 side ($450)</option>
                      <option value={2}>2 sides ($900)</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-alabaster/70 mb-2 block">Cutouts & Add-ons</label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-3 p-2.5 bg-slate/40 border border-gold/20 cursor-pointer"><input type="checkbox" checked={undermountSink} onChange={e => setUndermountSink(e.target.checked)} /> <span>Undermount Sink Cutout ($250)</span></label>
                  <label className="flex items-center gap-3 p-2.5 bg-slate/40 border border-gold/20 cursor-pointer"><input type="checkbox" checked={cooktop} onChange={e => setCooktop(e.target.checked)} /> <span>Cooktop Cutout ($200)</span></label>
                  <label className="flex items-center gap-3 p-2.5 bg-slate/40 border border-gold/20 cursor-pointer"><input type="checkbox" checked={tearOut} onChange={e => setTearOut(e.target.checked)} /> <span>Old Countertop Tear-Out ($350)</span></label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button type="button" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step===1} className="px-4 py-2 border border-gold/30 text-xs uppercase tracking-wider disabled:opacity-30">Back</button>
          {step < 4 ? (
            <button type="button" onClick={() => setStep(s => Math.min(4, s+1))} className="px-5 py-2 bg-gold text-obsidian text-xs font-bold uppercase tracking-wider">Next</button>
          ) : (
            <span className="text-xs text-alabaster/50 self-center">Step 4 of 4</span>
          )}
        </div>

        {!submitted ? (
          <div className="p-6 bg-obsidian border-2 border-gold/70 text-center">
            <div className="text-xs uppercase tracking-widest text-alabaster/70 mb-1">Your Personalized Installed Estimate</div>
            {!showGate ? (
              <>
                <div className="text-sm text-alabaster/70 my-4">Complete the quick lead form to reveal your tight installed price range and itemized summary for {quote.stoneName}.</div>
                <button type="button" onClick={() => setShowGate(true)} className="inline-block w-full sm:w-auto px-10 py-4 bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-gold/20">Get Instant Project Estimate</button>
              </>
            ) : (
              <form onSubmit={submitLead} className="text-left mt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="First Name *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full p-3 bg-slate/60 border border-gold/20 text-sm focus:outline-none focus:border-gold" />
                  <input required placeholder="Last Name *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full p-3 bg-slate/60 border border-gold/20 text-sm focus:outline-none focus:border-gold" />
                  <input required type="tel" placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 bg-slate/60 border border-gold/20 text-sm focus:outline-none focus:border-gold" />
                  <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-3 bg-slate/60 border border-gold/20 text-sm focus:outline-none focus:border-gold" />
                  <input required placeholder="City / Zip *" value={form.cityZip} onChange={e => setForm({ ...form, cityZip: e.target.value })} className="w-full p-3 bg-slate/60 border border-gold/20 text-sm focus:outline-none focus:border-gold sm:col-span-2" />
                </div>
                <label className="flex items-start gap-3 p-3 bg-slate/40 border border-gold/20 cursor-pointer text-sm">
                  <input type="checkbox" checked={callMe} onChange={e => setCallMe(e.target.checked)} className="mt-1" />
                  <span>Call me in 30 seconds via AI Concierge to schedule my free in-home measurement</span>
                </label>
                <button disabled={submitting} type="submit" className="w-full py-3.5 bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-widest disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Reveal My Instant Project Estimate'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="p-6 bg-obsidian border-2 border-gold text-center">
            <div className="text-xs uppercase tracking-widest text-alabaster/70 mb-1">Estimated Installed Range (Vero Beach)</div>
            <div className="font-serif text-3xl sm:text-5xl font-bold text-gold my-2">{formatCurrency(quote.rangeLow)} – {formatCurrency(quote.rangeHigh)} Installed</div>
            <div className="text-[11px] text-alabaster/60 mb-4">Based on {quote.stoneName} for {squareFeet} sq ft. Final pricing confirmed after laser templating and slab selection.</div>
            <div className="text-left text-xs text-alabaster/80 bg-slate/30 border border-gold/20 p-4 inline-block w-full max-w-xl">
              <div className="font-semibold text-gold uppercase tracking-wider mb-2">Itemized Summary & Inclusions</div>
              <ul className="space-y-1 mb-3">
                <li>Base material &amp; installation: {formatCurrency(quote.baseMaterialAndInstall)}</li>
                <li>Edge profiling / waterfall: {formatCurrency(quote.edgeUpgrade + quote.waterfallUpgrade)}</li>
                <li>Cutouts: {formatCurrency(quote.cutouts)} • Old countertop tear-out: {formatCurrency(quote.tearOut)}</li>
              </ul>
              <div><span className="font-semibold">Includes:</span> {quote.inclusions.join(', ')}.</div>
            </div>
            {callMe && <p className="text-sm text-emerald-300 mt-4">Request received — our AI Concierge may call you shortly to help schedule your free in-home measurement.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
