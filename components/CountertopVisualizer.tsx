'use client';

import { useMemo, useRef, useState } from 'react';
import { TOP_10_STONES, SAMPLE_ROOMS } from '@/lib/stones';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CountertopVisualizer() {
  const [selectedStoneId, setSelectedStoneId] = useState(TOP_10_STONES[0].id);
  const [beforeUrl, setBeforeUrl] = useState(SAMPLE_ROOMS[0].image);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [slider, setSlider] = useState(50);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sampleId, setSampleId] = useState(SAMPLE_ROOMS[0].id);
  const [mockPreview, setMockPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', city: '', projectType: 'Kitchen Remodel' });
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedStone = useMemo(() => TOP_10_STONES.find(s => s.id === selectedStoneId)!, [selectedStoneId]);

  function onSampleChange(id: string) {
    setSampleId(id);
    const room = SAMPLE_ROOMS.find(r => r.id === id)!;
    setBeforeUrl(room.image);
    setFile(null);
    setAfterUrl(null);
    setMockPreview(false);
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = await readFileAsDataUrl(f);
    setBeforeUrl(url);
    setAfterUrl(null);
    setMockPreview(false);
    setSubmitted(false);
  }

  function getEstimateForStone() {
    window.dispatchEvent(new CustomEvent('soi:select-stone', { detail: { stoneId: selectedStoneId } }));
    document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function generateAndCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.phone || !form.email) {
      setNote('Please enter your first name, phone, and email to receive your AI visualization.');
      return;
    }
    setLoading(true);
    setNote(null);
    setSubmitted(false);
    try {
      let imageBase64 = beforeUrl;
      if (file) imageBase64 = await readFileAsDataUrl(file);

      // 1) Generate visualization
      const vizRes = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          stoneId: selectedStoneId,
          prompt: `Replace only the countertop surfaces with ${selectedStone.name} (${selectedStone.type}, ${selectedStone.sheen} sheen, ${selectedStone.veining}, ${selectedStone.color}) while preserving cabinets and lighting.`,
        }),
      });
      const vizData = await vizRes.json().catch(() => ({}));
      if (!vizRes.ok) throw new Error(vizData.error || 'Visualization failed');

      const out = vizData.afterImageUrl || beforeUrl;
      const isMock = !!vizData.mock || out === beforeUrl || out === imageBase64;
      setAfterUrl(out);
      setMockPreview(isMock);

      // 2) Capture lead (so we can follow up / email stone & visualization details)
      const leadPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        city: form.city,
        cityZip: form.city,
        leadSource: 'ai-visualizer-gated',
        selectedStone: selectedStone.name,
        selectedStoneId: selectedStone.id,
        selectedStoneImage: selectedStone.image,
        projectType: form.projectType || 'Kitchen/Bath Visualization',
        estimatedRange: 'To be confirmed after consultation',
        callMeIn30Seconds: true,
        notes: `AI visualization requested for ${selectedStone.name}. Stone image: ${selectedStone.image}. ${isMock ? 'Mock/preview render (provider fallback or no AI key).' : 'AI render generated.'}`,
      };
      try {
        await fetch('/api/lead-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload),
        });
      } catch {}

      setSubmitted(true);
      setNote(isMock
        ? (vizData.note || 'Preview generated below. We’ll send your selected stone details to you shortly.')
        : 'Your AI visualization is ready below. We’ll also send your selected stone details to you.');
      // scroll to result
      setTimeout(() => document.getElementById('visualizer-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setAfterUrl(beforeUrl);
      setMockPreview(true);
      setSubmitted(true);
      setNote((e.message || 'Visualization failed.') + ' Showing a preview. Please try again or contact us at (772) 299-7560.');
    } finally {
      setLoading(false);
    }
  }

  const showAfter = afterUrl || beforeUrl;
  const displayAfter = !!afterUrl;

  return (
    <div className="space-y-8">
      <div className="glass-panel-dark rounded-none overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gold/30">
        <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gold/20 flex flex-col justify-between bg-slate/40">
          <div>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gold mb-3">1) Photo Source</label>
              <div className="space-y-3">
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gold/30 hover:border-gold p-5 text-center transition-colors cursor-pointer bg-obsidian/50 group">
                  <div className="text-2xl text-gold mb-1">↑</div>
                  <span className="text-sm font-semibold text-alabaster block">Upload Your Kitchen/Bath Photo</span>
                  <span className="text-xs text-alabaster/50 block mt-1">PNG, JPG, WEBP</span>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-alabaster/60 mb-2">Or select a sample Vero Beach kitchen</div>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_ROOMS.map(r => (
                      <button key={r.id} type="button" onClick={() => onSampleChange(r.id)} className={`text-left p-2.5 border text-xs ${sampleId === r.id && !file ? 'border-gold bg-gold/10' : 'border-gold/20 bg-slate/40 hover:border-gold/50'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gold">2) Choose Your Stone</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {TOP_10_STONES.map(stone => (
                  <button key={stone.id} type="button" onClick={() => setSelectedStoneId(stone.id)}
                    className={`text-left transition-all border overflow-hidden ${selectedStoneId === stone.id ? 'border-2 border-gold bg-slate/80 shadow-lg shadow-gold/10' : 'border-gold/20 hover:border-gold/60 bg-slate/40'}`}>
                    <div className="flex gap-2.5 p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={stone.image} alt={`${stone.name} close-up slab`} className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-cover border border-gold/30 flex-shrink-0 bg-obsidian" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-alabaster truncate">{stone.name}</div>
                        <div className="text-[10px] text-gold/80 uppercase mb-1">{stone.type} • {stone.origin}</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 border border-gold/30 text-alabaster/80">Heat {stone.heatRating}</span>
                          <span className="text-[9px] px-1.5 py-0.5 border border-gold/30 text-alabaster/80">Scratch {stone.scratchRating}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedStone && (
                <div className="mt-3 p-2.5 border border-gold/20 bg-obsidian/40 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedStone.image} alt={`${selectedStone.name} HD close-up`} className="w-20 h-20 object-cover border border-gold/30 flex-shrink-0" />
                  <div className="text-[11px] text-alabaster/70 leading-relaxed">
                    <div className="text-alabaster font-semibold mb-0.5">Selected: {selectedStone.name}</div>
                    {selectedStone.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gold/20">
            <div className="text-[11px] text-alabaster/60 mb-3">Enter your details to generate your personalized AI visualization and receive your selected stone details.</div>
            <button onClick={getEstimateForStone} type="button" className="w-full py-3 border border-gold/40 text-alabaster text-xs font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors">
              Get Estimate for This Stone
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 bg-obsidian/40">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">3) Get Your Personalized AI Visualization</div>
            <p className="text-sm text-alabaster/70">Enter your details to render a fresh AI visualization with <span className="text-gold font-semibold">{selectedStone.name}</span>. We’ll generate your result below and send your selected stone details to you.</p>
          </div>

          <form onSubmit={generateAndCapture} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">First Name *</label>
                <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" placeholder="First name" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" placeholder="Last name" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" placeholder="(772) 555-0199" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" placeholder="you@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">City / Zip</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold" placeholder="Vero Beach, 32963" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-alabaster/70 mb-1.5">Project Type</label>
                <select value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })} className="w-full p-3 bg-slate/50 border border-gold/20 text-alabaster text-sm focus:outline-none focus:border-gold">
                  <option>Kitchen Remodel</option>
                  <option>Bathroom Vanity</option>
                  <option>Waterfall Island</option>
                  <option>Outdoor Summer Kitchen</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="p-3 border border-gold/20 bg-slate/30 text-[11px] text-alabaster/60">
              By submitting, you’ll receive your personalized visualization and your selected stone details by phone/email.
            </div>

            <button disabled={loading} type="submit" className="w-full py-3.5 bg-gold text-obsidian text-xs font-bold uppercase tracking-widest hover:bg-gold-hover transition-colors disabled:opacity-60 shadow-lg shadow-gold/20">
              {loading ? 'Generating Your AI Visualization...' : 'Generate My AI Visualization & Send Stone Details'}
            </button>
          </form>

          {note && <div className="mt-4 text-[11px] text-amber-200/90 bg-amber-900/20 border border-amber-500/20 p-3">{note}</div>}
        </div>
      </div>

      {/* Result / mockup visual */}
      <div id="visualizer-result" className="glass-panel-dark border border-gold/30 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gold/20 flex items-center justify-between gap-3 bg-slate/30">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gold">{displayAfter ? 'Your AI Visualization Result' : 'Before & After Mockup Preview'}</div>
            <div className="text-sm text-alabaster/80">
              {displayAfter
                ? `${selectedStone.name} applied to your selected photo`
                : `Mockup preview with ${selectedStone.name}. Enter your details above to generate your personalized AI before/after visualization.`}
            </div>
          </div>
          {displayAfter && <a href="#estimator" className="hidden sm:inline-flex px-4 py-2 bg-gold text-obsidian text-xs font-bold uppercase tracking-wider">Get Estimate</a>}
        </div>
        <div className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[560px] bg-black select-none overflow-hidden">
          {/* After (base) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showAfter}
            className="absolute inset-0 w-full h-full object-cover"
            alt={displayAfter ? `After with ${selectedStone.name}` : `After mockup preview with ${selectedStone.name}`}
            style={{ filter: displayAfter && !mockPreview ? undefined : 'saturate(1.14) contrast(1.05) sepia(0.08) hue-rotate(-4deg) brightness(1.02)' }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-gold/10 via-transparent to-white/5 mix-blend-overlay" />
          <span className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-gold/30 z-20 pointer-events-none">
            {displayAfter ? `After • ${selectedStone.name}${mockPreview ? ' (Preview)' : ''}` : `After Mockup • ${selectedStone.name}`}
          </span>

          {/* Before (top overlay, swiped away to reveal after) */}
          <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={beforeUrl} className="absolute inset-0 w-full h-full object-cover" alt="Before countertop" />
            <span className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md text-alabaster/90 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-alabaster/20 z-20 pointer-events-none">Before</span>
          </div>

          <div className="absolute top-0 bottom-0 z-30 -translate-x-1/2 pointer-events-none" style={{ left: `${slider}%` }}>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gold shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold text-obsidian flex items-center justify-center shadow-2xl font-bold border-2 border-alabaster">↔</div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={e => setSlider(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40 m-0"
            aria-label="Before and after comparison slider"
          />

          {!displayAfter && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-obsidian/70 backdrop-blur-md border border-gold/30 px-3 py-1.5 text-[11px] text-alabaster/80 pointer-events-none">
              Mockup preview • Submit above to generate your personalized AI result
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
