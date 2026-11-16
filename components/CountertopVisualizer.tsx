'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [compareWidth, setCompareWidth] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const selectedStone = useMemo(() => TOP_10_STONES.find(s => s.id === selectedStoneId)!, [selectedStoneId]);

  useEffect(() => {
    const el = compareRef.current;
    if (!el) return;
    const update = () => setCompareWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  function onSampleChange(id: string) {
    setSampleId(id);
    const room = SAMPLE_ROOMS.find(r => r.id === id)!;
    setBeforeUrl(room.image);
    setFile(null);
    setAfterUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = await readFileAsDataUrl(f);
    setBeforeUrl(url);
    setAfterUrl(null);
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
      if (data.afterImageUrl) setAfterUrl(data.afterImageUrl);
      if (data.note) setNote(data.note);
      else if (data.mock) setNote('Mock visualization mode (no API key configured). Configure GEMINI_API_KEY or REPLICATE_API_TOKEN to enable AI rendering.');
    } catch (e: any) {
      setNote(e.message || 'Visualization failed. A mock/fallback preview is shown when keys are not configured.');
      if (!afterUrl) setAfterUrl(beforeUrl);
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
            <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {TOP_10_STONES.map(stone => (
                <button key={stone.id} type="button" onClick={() => setSelectedStoneId(stone.id)}
                  className={`p-2.5 text-left transition-all border ${selectedStoneId === stone.id ? 'border-2 border-gold bg-slate/80' : 'border-gold/20 hover:border-gold/60 bg-slate/40'}`}>
                  <div className="text-xs font-bold text-alabaster truncate">{stone.name}</div>
                  <div className="text-[10px] text-gold/80 uppercase mb-1">{stone.type}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] px-1.5 py-0.5 border border-gold/30 text-alabaster/80">Heat: {stone.heatRating}</span>
                    <span className="text-[9px] px-1.5 py-0.5 border border-gold/30 text-alabaster/80">Scratch: {stone.scratchRating}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 border ${stone.outdoorUvSafe ? 'border-emerald-400/50 text-emerald-300 bg-emerald-900/20' : 'border-gold/20 text-alabaster/50'}`}>
                      {stone.outdoorUvSafe ? 'Indoor/Outdoor UV Safe' : 'Indoor Recommended'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-alabaster/60">{selectedStone.description} {selectedStone.outdoorUvSafe && <span className="text-emerald-300">Excellent for Vero Beach outdoor summer kitchens.</span>}</div>
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
          {!afterUrl && <div className="text-[11px] text-alabaster/50">Tip: click “Render Selected Stone” to generate/apply a visualization (mock preview shown if no AI key is configured).</div>}
        </div>
      </div>

      <div ref={compareRef} className="lg:col-span-7 relative min-h-[420px] lg:min-h-[580px] bg-black select-none overflow-hidden">
        {/* After / result layer */}
        <img src={showAfter} className="absolute inset-0 w-full h-full object-cover" alt={`Visualization with ${selectedStone.name}`} />
        <span className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-gold/30 z-20 pointer-events-none">
          {selectedStone.name}
        </span>

        {/* Before layer clipped */}
        <div className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r-2 border-gold shadow-2xl" style={{ width: `${slider}%` }}>
          <img
            src={beforeUrl}
            alt="Before"
            className="absolute top-0 left-0 h-full max-w-none object-cover"
            style={{ width: compareWidth ? `${compareWidth}px` : '100vw' }}
          />
          <span className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md text-alabaster/80 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-alabaster/20 pointer-events-none">Before</span>
        </div>

        {/* Handle */}
        <div className="absolute top-0 bottom-0 z-30 -translate-x-1/2 flex items-center justify-center pointer-events-none" style={{ left: `${slider}%` }}>
          <div className="w-10 h-10 rounded-full bg-gold text-obsidian flex items-center justify-center shadow-2xl font-bold border-2 border-alabaster">↔</div>
          <div className="absolute top-0 bottom-0 w-px bg-gold/0" />
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
      </div>
    </div>
  );
}
