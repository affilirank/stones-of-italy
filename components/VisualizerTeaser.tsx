'use client';

import { useState } from 'react';
import { SAMPLE_ROOMS, TOP_10_STONES } from '@/lib/stones';

export default function VisualizerTeaser() {
  const [slider, setSlider] = useState(50);
  const before = SAMPLE_ROOMS[0].image;
  const after = SAMPLE_ROOMS[1].image; // teaser contrast image
  const stone = TOP_10_STONES[0];

  return (
    <section className="py-20 bg-slate/60 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Before &amp; After Mockup Preview</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-alabaster mb-4">See the Transformation Before You Commit</h2>
            <p className="text-alabaster/70 mb-5">Preview a <span className="text-alabaster font-semibold">before-and-after countertop mockup</span>, then create your own personalized AI visualization from your kitchen or bath photo. Enter a few details and we’ll generate your custom result and send your selected stone details to you.</p>
            <ul className="space-y-2 text-sm text-alabaster/75 mb-6">
              <li>• Drag the slider to compare before and after</li>
              <li>• Upload your photo or use a sample Vero Beach kitchen</li>
              <li>• Choose from our Top 10 signature stones for your custom render</li>
            </ul>
            <a href="#visualizer" className="inline-flex items-center justify-center px-6 py-3 bg-gold text-obsidian text-xs font-bold uppercase tracking-widest hover:bg-gold-hover transition-colors shadow-lg shadow-gold/20">Create My Personalized Visualization</a>
          </div>
          <div className="lg:col-span-7">
            <div className="relative min-h-[320px] sm:min-h-[440px] border border-gold/30 overflow-hidden bg-black shadow-2xl">
              {/* After (base) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={after} alt="Kitchen after mockup" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'saturate(1.08) contrast(1.04) brightness(1.02)' }} />
              <span className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-gold/30 z-20 pointer-events-none">After Mockup • {stone.name}</span>

              {/* Before (top overlay, swiped away to reveal after) */}
              <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={before} alt="Kitchen before mockup" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md text-alabaster/90 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-alabaster/20 z-20 pointer-events-none">Before</span>
              </div>

              <div className="absolute top-0 bottom-0 z-30 -translate-x-1/2 pointer-events-none" style={{ left: `${slider}%` }}>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gold shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold text-obsidian flex items-center justify-center shadow-2xl font-bold border-2 border-alabaster">↔</div>
              </div>
              <input type="range" min={0} max={100} value={slider} onChange={e => setSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40 m-0" aria-label="Before and after mockup slider" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-obsidian/70 backdrop-blur-md border border-gold/30 px-3 py-1.5 text-[11px] text-alabaster/80 pointer-events-none">Drag to compare before &amp; after • Get your custom AI render below</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
