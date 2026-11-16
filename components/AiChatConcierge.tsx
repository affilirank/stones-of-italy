'use client';

import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

function extractContact(text: string) {
  const phoneMatch = text.match(/(\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  // naive name: "my name is ..." or "I'm ..." or "this is ..."
  const nameMatch = text.match(/(?:my name is|i'?m|this is|i am)\s+([a-zA-Z][a-zA-Z'.-]*(?:\s+[a-zA-Z][a-zA-Z'.-]*){0,3})/i);
  return {
    phone: phoneMatch ? phoneMatch[1].trim() : '',
    email: emailMatch ? emailMatch[1].trim() : '',
    name: nameMatch ? nameMatch[1].trim().replace(/[,.!?]+$/, '') : '',
  };
}

export default function AiChatConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi, I’m Sofia — your Stones of Italy stone specialist in Vero Beach. I can help you compare our Top 10 stones, recommend the best surface for your kitchen, bath, or outdoor space, and arrange a free in-home measurement or showroom visit. What are you planning?" }
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open, loading]);

  const quickReplies = [
    'What are your business hours?',
    'Best stone for outdoor kitchen?',
    'Quartzite vs marble for heavy cooks',
    'I want a free estimate',
  ];

  async function submitLead(info: { name: string; phone: string; email?: string }, context: string) {
    if (captured || !info.name || !info.phone) return false;
    try {
      const parts = info.name.trim().split(/\s+/);
      const res = await fetch('/api/lead-capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0] || info.name,
          lastName: parts.slice(1).join(' '),
          phone: info.phone,
          email: info.email || `${info.phone.replace(/\D/g, '')}@placeholder.local`,
          leadSource: 'ai-chat-concierge',
          selectedStone: 'Consultation',
          projectType: 'Estimate/Callback Request',
          estimatedRange: 'To be confirmed after consultation',
          callMeIn30Seconds: true,
          notes: `AI concierge chat lead. Context: ${context.slice(0, 300)}`,
        })
      });
      if (!res.ok) throw new Error('lead failed');
      setCaptured(true);
      return true;
    } catch {
      return false;
    }
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    // learn contact details from conversation
    const found = extractContact(content);
    const merged = {
      name: contact.name || found.name,
      phone: contact.phone || found.phone,
      email: contact.email || found.email,
    };
    if (merged.name !== contact.name || merged.phone !== contact.phone || merged.email !== contact.email) {
      setContact(merged);
    }

    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      let reply = data.reply || 'How else can I assist with your countertop project?';

      // auto-capture when we have enough info and intent
      const intent = /estimate|callback|call me|book|appointment|measure|showroom|quote|visit|schedule/i.test(content) || /estimate|callback|measure|showroom|visit|schedule/i.test(reply);
      let appended = '';
      if (!captured && intent && merged.name && merged.phone) {
        const ok = await submitLead(merged, content);
        if (ok) appended = `\n\nI’ve got your details (${merged.name}, ${merged.phone}). I’m notifying our team now so you can get a quick follow-up/callback to schedule your free estimate.`;
      } else if (!captured && intent && (!merged.name || !merged.phone)) {
        appended = `\n\nIf you’d like, share your name and best phone number right here in chat and I’ll arrange a quick callback/free estimate for you.`;
      }

      setMessages([...next, { role: 'assistant', content: reply + appended }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'I’m having a brief connection issue. You can call us at (772) 299-7560 (Mon–Fri 8–5, Sat 8–2), or tell me your name and phone number and I’ll help arrange a callback when I reconnect.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50">
      <button onClick={() => setOpen(o => !o)} className="relative group bg-obsidian border-2 border-gold text-gold p-4 shadow-2xl flex items-center gap-3 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-none">
        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span></span>
        <i className="bi bi-stars text-xl"></i>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">AI Stone Specialist • Live</span>
      </button>
      {open && (
        <div className="absolute bottom-16 right-0 w-[22rem] sm:w-[26rem] glass-panel-dark border border-gold/40 shadow-2xl mb-2 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gold/20 bg-obsidian/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-gold/50 bg-gold/10 flex items-center justify-center text-gold"><i className="bi bi-gem"></i></div>
              <div>
                <div className="font-serif font-bold text-sm text-alabaster leading-tight">Sofia • AI Stone Specialist</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Online • Stones of Italy, Vero Beach</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-alabaster/60 hover:text-alabaster text-xl leading-none">×</button>
          </div>

          <div className="px-4 py-3 space-y-3 text-[13px] max-h-80 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate/20 to-transparent">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'assistant' ? 'flex gap-2' : 'flex gap-2 justify-end'}>
                {m.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gold/20 text-gold text-[10px] flex items-center justify-center border border-gold/30 mt-0.5 flex-shrink-0">AI</div>}
                <div className={m.role === 'assistant'
                  ? 'bg-slate/60 p-3 text-alabaster/95 border border-gold/20 rounded-sm max-w-[88%] whitespace-pre-wrap leading-relaxed'
                  : 'bg-gold/15 p-3 text-alabaster border border-gold/30 rounded-sm max-w-[85%] whitespace-pre-wrap leading-relaxed'}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold text-[10px] flex items-center justify-center border border-gold/30 mt-0.5">AI</div>
                <div className="bg-slate/60 px-3 py-2 text-alabaster/70 border border-gold/20 rounded-sm text-xs">Sofia is typing…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-4 pb-2 pt-1 border-t border-gold/10 bg-obsidian/40">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickReplies.map(q => (
                <button key={q} type="button" onClick={() => send(q)} className="text-[10px] px-2.5 py-1.5 border border-gold/30 text-alabaster/80 hover:border-gold hover:text-gold bg-slate/40 transition-colors">
                  {q}
                </button>
              ))}
            </div>
            {captured ? (
              <div className="text-[11px] text-emerald-300 bg-emerald-900/20 border border-emerald-500/20 p-2 mb-2">✓ Your details are in — our team can follow up shortly. Need immediate help? Call 772-299-7560.</div>
            ) : (contact.name || contact.phone) ? (
              <div className="text-[10px] text-alabaster/50 mb-2">I can arrange a callback if you share your { !contact.name ? 'name' : '' }{!contact.name && !contact.phone ? ' and ' : ''}{ !contact.phone ? 'phone number' : '' } in chat.</div>
            ) : null}
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Sofia anything… (stones, pricing, outdoor, booking)" className="flex-1 p-2.5 bg-slate/60 border border-gold/30 text-xs text-alabaster focus:outline-none focus:border-gold placeholder:text-alabaster/40" />
              <button disabled={loading || !input.trim()} type="submit" className="px-3.5 bg-gold text-obsidian text-xs font-bold uppercase disabled:opacity-50 hover:bg-gold-hover transition-colors">Send</button>
            </form>
            <div className="text-[10px] text-alabaster/40 mt-2 pb-1">4646 US-1, Vero Beach • 772-299-7560 • Mon–Fri 8–5, Sat 8–2</div>
          </div>
        </div>
      )}
    </div>
  );
}
