import StonesOfItalyLogo from '@/components/StonesOfItalyLogo';
import CountertopVisualizer from '@/components/CountertopVisualizer';
import InstantQuoteCalculator from '@/components/InstantQuoteCalculator';
import AiChatConcierge from '@/components/AiChatConcierge';
import BookingSection from '@/components/BookingSection';
import VisualizerTeaser from '@/components/VisualizerTeaser';
import { TOP_10_STONES } from '@/lib/stones';

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <header className="sticky top-0 z-50 glass-panel-dark border-b border-gold/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[88px] md:h-28 flex items-center justify-between gap-3 py-3 md:py-0">
          <a href="#" className="flex items-center gap-3 md:gap-4 group min-w-0 flex-1">
            <StonesOfItalyLogo size={72} className="md:!w-[104px] md:!h-[104px] flex-shrink-0" />
            <div className="min-w-0">
              <span className="block font-serif text-sm sm:text-lg md:text-xl font-bold tracking-wider text-alabaster uppercase leading-tight group-hover:text-gold transition-colors truncate">Stones of Italy</span>
              <span className="block font-sans text-[10px] sm:text-xs tracking-widest text-gold uppercase leading-snug">Vero Beach • Master Stone Crafters</span>
            </div>
          </a>
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#visualizer" className="text-sm uppercase tracking-wider text-alabaster/80 hover:text-gold transition-colors">AI Visualizer</a>
            <a href="#gallery" className="text-sm uppercase tracking-wider text-alabaster/80 hover:text-gold transition-colors">Top 10 Slabs</a>
            <a href="#estimator" className="text-sm uppercase tracking-wider text-alabaster/80 hover:text-gold transition-colors">Instant Estimator</a>
            <a href="#reviews" className="text-sm uppercase tracking-wider text-alabaster/80 hover:text-gold transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <a href="#estimator" className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold tracking-wider text-alabaster uppercase border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all">Instant Estimate</a>
            <a href="#booking" className="inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold tracking-wider text-obsidian uppercase bg-gold hover:bg-gold-hover transition-all shadow-lg shadow-gold/20 whitespace-nowrap">Book Showroom</a>
          </div>
        </div>
      </header>

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-gold/20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105" style={{backgroundImage: "url('https://media.clicksites.ai/clicksites/uploads/3362/ultra_luxury_modern_kitchen_in_6d56718ddbeccdb7b307eca9bf3140ad.png')"}} />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/85 to-obsidian/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-gold/40 bg-obsidian/80 backdrop-blur-md mb-6">
              <i className="bi bi-gem text-gold"></i>
              <span className="text-xs uppercase tracking-widest font-semibold text-gold">Treasure Coast&apos;s Stone Authority • Family-Owned Since 2001</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight text-alabaster mb-6">
              Italian Craftsmanship Meets <span className="gold-gradient-text italic font-normal">Vero Beach Luxury.</span>
            </h1>
            <p className="text-lg sm:text-xl text-alabaster/80 font-light leading-relaxed mb-8 max-w-2xl">
              Custom Quartzite, Marble, Quartz, Granite &amp; Porcelain Countertops — Laser Templated, In-House Fabricated &amp; Professionally Installed in 5–7 Days. Visit 4646 US-1, Vero Beach, FL.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
              <a href="#visualizer" className="px-8 py-4 bg-gold hover:bg-gold-hover text-obsidian text-sm font-bold uppercase tracking-widest transition-all duration-300 text-center shadow-xl shadow-gold/20 flex items-center justify-center gap-2"><i className="bi bi-magic text-base"></i> Try AI Visualizer</a>
              <a href="#estimator" className="px-8 py-4 bg-transparent border border-alabaster/40 hover:border-gold hover:text-gold text-alabaster text-sm font-bold uppercase tracking-widest transition-all duration-300 text-center backdrop-blur-sm flex items-center justify-center gap-2"><i className="bi bi-calculator text-base"></i> Get Instant Project Estimate</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-alabaster/10 text-center sm:text-left">
              <div className="flex items-center gap-3"><i className="bi bi-patch-check-fill text-gold text-2xl"></i><div><div className="text-sm font-bold text-alabaster">25+ Years</div><div className="text-xs text-alabaster/60">Vero Beach, FL</div></div></div>
              <div className="flex items-center gap-3"><i className="bi bi-star-fill text-gold text-xl"></i><div><div className="text-sm font-bold text-alabaster">4.7★ Google Rated</div><div className="text-xs text-alabaster/60">Trusted Locally</div></div></div>
              <div className="flex items-center gap-3"><i className="bi bi-bounding-box-circles text-gold text-2xl"></i><div><div className="text-sm font-bold text-alabaster">Laser Templating</div><div className="text-xs text-alabaster/60">Precision Fit</div></div></div>
              <div className="flex items-center gap-3"><i className="bi bi-clock-history text-gold text-2xl"></i><div><div className="text-sm font-bold text-alabaster">5–7 Day Turnaround</div><div className="text-xs text-alabaster/60">Template to Install</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <VisualizerTeaser />

      <section id="visualizer" className="py-24 bg-obsidian relative border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Personalized AI Visualization</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-alabaster mb-4">Create Your Custom Stone Visualization</h2>
            <p className="text-alabaster/70 text-base">Choose your photo and signature stone, enter a few details, and we’ll generate your fresh AI before/after visualization below and send your selected stone details to you.</p>
          </div>
          <CountertopVisualizer />
        </div>
      </section>

      <section id="gallery" className="py-24 bg-alabaster text-obsidian border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Exclusive Hand-Selected Inventory</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-obsidian">Curated Italian &amp; Global Slabs</h2>
            </div>
            <p className="text-slate text-sm max-w-md mt-4 md:mt-0 font-light">Direct imported premium natural quartzite, marble, granite, quartz, porcelain, and dolomite slabs stocked at our Vero Beach yard. Tap a stone to visualize it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TOP_10_STONES.map((stone) => (
              <div key={stone.id} className="bg-white border border-gold/20 hover:border-gold transition-all duration-300 group shadow-md hover:shadow-2xl flex flex-col">
                <div className="relative h-64 overflow-hidden bg-obsidian">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stone.image} alt={`${stone.name} HD close-up`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute top-4 left-4 bg-obsidian/90 text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-gold/30">{stone.type}</div>
                  <div className="absolute bottom-4 right-4 bg-white/90 text-obsidian text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">{stone.origin}</div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-serif text-xl font-bold">{stone.name}</h3>
                    <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 whitespace-nowrap">${stone.installedRateSqFt}/sf</span>
                  </div>
                  <p className="text-sm text-slate mb-4 leading-relaxed">{stone.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] px-2 py-1 border border-gold/30 text-obsidian/80 bg-alabaster">Heat: {stone.heatRating}</span>
                    <span className="text-[10px] px-2 py-1 border border-gold/30 text-obsidian/80 bg-alabaster">Scratch: {stone.scratchRating}</span>
                    <span className={`text-[10px] px-2 py-1 border ${stone.outdoorUvSafe ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50' : 'border-slate/20 text-slate bg-alabaster'}`}>{stone.outdoorUvSafe ? 'Indoor/Outdoor UV Safe' : 'Indoor Recommended'}</span>
                  </div>
                  <div className="text-xs text-slate-light mb-4">Best for: {stone.bestFor.join(' • ')}</div>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <a href="#visualizer" className="text-center py-2.5 border border-gold/40 text-obsidian text-xs font-bold uppercase tracking-wider hover:bg-gold/10 transition-colors">Visualize</a>
                    <a href="#estimator" className="text-center py-2.5 bg-gold text-obsidian text-xs font-bold uppercase tracking-wider hover:bg-gold-hover transition-colors">Get Estimate</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="estimator" className="py-24 bg-obsidian text-alabaster relative border-b border-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Precision Pricing</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-3">Precision Countertop Project Estimator</h2>
            <p className="text-alabaster/70 text-sm">Receive a realistic, localized Vero Beach installed range with a clear breakdown including laser templating, custom fabrication, edge profiling, and professional installation.</p>
          </div>
          <InstantQuoteCalculator />
        </div>
      </section>

      <BookingSection />

      <section id="about" className="py-20 bg-slate border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-3xl text-alabaster mb-4">Stones of Italy, Inc. — Vero Beach Showroom</h3>
            <p className="text-alabaster/70 mb-4">Family-owned since 2001, Stones of Italy delivers premium quartzite, marble, quartz, granite, porcelain, and dolomite surfaces across Vero Beach and the Treasure Coast. From laser templating to in-house fabrication and professional installation, our team completes most projects in 5–7 days from template to install.</p>
            <ul className="text-sm text-alabaster/80 space-y-2">
              <li><i className="bi bi-geo-alt text-gold mr-2"></i>4646 US-1, Vero Beach, FL 32967</li>
              <li><i className="bi bi-telephone text-gold mr-2"></i><a href="tel:7722997560" className="hover:text-gold">(772) 299-7560</a></li>
              <li><i className="bi bi-clock text-gold mr-2"></i>Mon–Fri 8:00 AM – 5:00 PM, Sat 8:00 AM – 2:00 PM</li>
            </ul>
          </div>
          <div className="bg-obsidian border border-gold/30 p-6">
            <div className="text-gold uppercase tracking-widest text-xs font-bold mb-3">Why Homeowners Choose Us</div>
            <ul className="text-sm text-alabaster/70 space-y-2 list-disc list-inside">
              <li>4.7★ Google rated, trusted local craftsmanship</li>
              <li>Top 10 signature stones + full slab yard selection</li>
              <li>Quartzite & porcelain recommendations for Florida outdoor kitchens</li>
              <li>Clear installed estimates and consultative guidance</li>
              <li>Fast, reliable 5–7 day template-to-install turnaround</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-24 bg-alabaster text-obsidian border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Vero Beach Reputation</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-obsidian mb-3">Craftsmanship Praised by Neighbors</h2>
            <div className="text-gold text-lg mb-2">★★★★★</div>
            <p className="text-slate text-xs uppercase tracking-wider font-semibold">4.7 Rating across 127+ Verified Google Reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: '"Mike Sr. and Diego templated our John\'s Island kitchen with laser precision. The Taj Mahal waterfall island seams are completely invisible. Honest pricing and delivered 2 days ahead of schedule!"', name: 'Richard & Helen Vance', loc: "John's Island, Vero Beach", init: 'RH' },
              { quote: '"Angelo and Michael did a spotless installation in our Orchid Island home. They treated our property with absolute care, cleaned everything, and the Calacatta marble is breathtaking."', name: 'Caroline Montgomery', loc: 'Orchid Island, FL', init: 'CM' },
              { quote: '"Having dealt with multiple fabricators on the Treasure Coast, Stones of Italy is unmatched. Their US-1 showroom slab yard allowed us to hand-select our exact porcelain lot."', name: 'David & Brenda K.', loc: 'Grand Harbor, Vero Beach', init: 'DB' },
            ].map(r => (
              <div key={r.name} className="bg-white p-8 border border-gold/20 shadow-lg flex flex-col justify-between">
                <p className="text-slate text-sm leading-relaxed mb-6 italic">{r.quote}</p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate/10">
                  <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-serif font-bold">{r.init}</div>
                  <div><div className="text-xs font-bold text-obsidian">{r.name}</div><div className="text-[10px] text-slate-light">{r.loc}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-obsidian text-alabaster pt-16 pb-28 md:pb-12 border-t border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <StonesOfItalyLogo size={232} />
              </div>
              <p className="text-xs text-alabaster/60 leading-relaxed mb-4">Premier natural stone fabricators &amp; certified porcelain installers serving Vero Beach, Sebastian, and the entire Treasure Coast since 2001.</p>
              <div className="text-xs text-gold">Licensed &amp; Insured #CBC1264821</div>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-alabaster mb-4 uppercase tracking-wider">Vero Beach Showroom</h4>
              <ul className="space-y-3 text-xs text-alabaster/70">
                <li>4646 US-1, Vero Beach, FL 32967</li>
                <li><a href="tel:7722997560" className="hover:text-gold transition-colors">772-299-7560</a></li>
                <li>Mon–Fri: 8:00 AM – 5:00 PM<br/>Sat: 8:00 AM – 2:00 PM<br/>Sun: Closed / By Appt</li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-alabaster mb-4 uppercase tracking-wider">Treasure Coast Service</h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-alabaster/70">
                {['Vero Beach',"John's Island",'Orchid Island','Sebastian','Hutchinson Island','Fort Pierce'].map(a => <li key={a}>{a}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-alabaster mb-4 uppercase tracking-wider">Get Started</h4>
              <p className="text-xs text-alabaster/60 mb-4">Visualize your stone, receive a precision installed estimate, and schedule your free in-home measurement or showroom visit.</p>
              <a href="#estimator" className="block w-full py-3 bg-gold text-obsidian font-bold text-xs uppercase tracking-widest text-center hover:bg-gold-hover transition-colors">Get Instant Project Estimate</a>
            </div>
          </div>
          <div className="pt-8 border-t border-alabaster/10 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-alabaster/40">
            <div>© 2001–2026 Stones of Italy, Inc. All Rights Reserved.</div>
            <div className="mt-2 sm:mt-0 space-x-4"><a href="#" className="hover:text-gold">Privacy Policy</a><a href="#" className="hover:text-gold">Terms</a></div>
          </div>
        </div>
      </footer>

      {/* Sticky mobile bottom action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel-dark border-t border-gold/30 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-3 gap-2">
          <a href="#visualizer" className="py-3 text-center bg-slate/70 border border-gold/40 text-alabaster text-[11px] font-bold uppercase tracking-wider">Visualizer</a>
          <a href="#estimator" className="py-3 text-center bg-gold text-obsidian text-[11px] font-bold uppercase tracking-wider">Estimate</a>
          <a href="#booking" className="py-3 text-center bg-slate/70 border border-gold/40 text-alabaster text-[11px] font-bold uppercase tracking-wider">Book</a>
        </div>
      </div>

      <AiChatConcierge />
    </main>
  );
}
