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
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedStone = useMemo(() => TOP_10_STONES.find(s => s.id === selectedStoneId)!, [selectedStoneId]);

  function onSampleChange(id: string) {
    setSampleId(id);
    const room = SAMPLE_ROOMS.find(r => r.id === id)!;
    setBeforeUrl(room.image);
    setFile(null);
    setAfterUrl(null);
    setMockPreview(false);
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
  }

  async function generate() {
    setLoading(true);
    setNote(null);
    try {
      let imageBase64 = beforeUrl;
      if (file) imageBase64 = await readFileAsDataUrl(file);
      const res = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          stoneId: selectedStoneId,
          prompt: `Replace only the countertop surfaces with ${selectedStone.name} (${selectedStone.type}, ${selectedStone.sheen} sheen, ${selectedStone.veining}, ${selectedStone.color}) while preserving cabinets and lighting.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Visualization failed');
      const out = data.afterImageUrl || beforeUrl;
      const isMock = !!data.mock || out === beforeUrl || out === imageBase64;
      setAfterUrl(out);
      setMockPreview(isMock);
      if (data.note) setNote(data.note);
      else if (isMock) setNote('Mock visualization mode (no AI key configured). Configure GEMINI_API_KEY or REPLICATE_API_TOKEN to enable AI rendering. Showing a preview overlay so you can test the before/after slider.');
      else setNote(null);
    } catch (e: any) {
      setAfterUrl(beforeUrl);
      setMockPreview(true);
      setNote((e.message || 'Visualization failed.') + ' Showing preview mode so you can test the before/after slider.');
    } finally {
      setLoading(false);
    }
  }

  function getEstimateForStone() {
    window.dispatchEvent(new CustomEvent('soi:select-stone', { detail: { stoneId: selectedStoneId } }));
    document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
  }

  const showAfter = afterUrl || beforeUrl;

  return (
    <div className="glass-panel-dark rounded-none overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gold/30">
      <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gold/20 flex flex-col justify-between bg-slate/40">
        <div>
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gold mb-3">Photo Source</label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-gold">Top 10 Signature Stones</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
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
                        <span className={`text-[9px] px-1.5 py-0.5 border ${stone.outdoorUvSafe ? 'border-emerald-400/50 text-emerald-300 bg-emerald-900/20' : 'border-gold/20 text-alabaster/50'}`}>
                          {stone.outdoorUvSafe ? 'UV Safe' : 'Indoor'}
                        </span>
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
                  <div className="text-alabaster font-semibold mb-0.5">{selectedStone.name} — HD slab close-up</div>
                  {selectedStone.description} {selectedStone.outdoorUvSafe && <span className="text-emerald-300">Excellent for Vero Beach outdoor summer kitchens.</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gold/20 space-y-3">
          <button onClick={generate} disabled={loading} className="w-full py-3 bg-gold text-obsidian text-xs font-bold uppercase tracking-widest hover:bg-gold-hover transition-colors disabled:opacity-60">
            {loading ? 'Rendering Visualization...' : 'Render Selected Stone'}
          </button>
          <button onClick={getEstimateForStone} className="w-full py-3 border border-gold/40 text-alabaster text-xs font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors">
            Get Estimate for This Stone
          </button>
          {note && <div className="text-[11px] text-amber-200/90 bg-amber-900/20 border border-amber-500/20 p-2">{note}</div>}
          {!afterUrl && <div className="text-[11px] text-alabaster/50">Tip: click “Render Selected Stone” to generate a visualization. Drag the slider to compare before/after (mock preview if no AI key is configured).</div>}
        </div>
      </div>

      <div className="lg:col-span-7 relative min-h-[420px] lg:min-h-[580px] bg-black select-none overflow-hidden">
        {/* Before (base) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeUrl} className="absolute inset-0 w-full h-full object-cover" alt="Before countertop" />
        <span className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md text-alabaster/90 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-alabaster/20 z-20 pointer-events-none">Before</span>

        {/* After (clipped overlay) */}
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showAfter}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`After with ${selectedStone.name}`}
            style={mockPreview ? { filter: 'saturate(1.12) contrast(1.04) sepia(0.08) hue-rotate(-6deg)' } : undefined}
          />
          {mockPreview && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-gold/10 via-transparent to-white/5 mix-blend-overlay" />
          )}
          <span className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-gold/30 z-20 pointer-events-none">
            After • {selectedStone.name}{mockPreview ? ' (Preview)' : ''}
          </span>
        </div>

        {/* Divider + handle */}
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

        {!afterUrl && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-obsidian/70 backdrop-blur-md border border-gold/30 px-3 py-1.5 text-[11px] text-alabaster/80 pointer-events-none">
            Drag slider • Click “Render Selected Stone” for AI/mock preview
          </div>
        )}
      </div>
    </div>
  );
}
