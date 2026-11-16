'use client';

import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AiChatConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', email: '' });
  const [captured, setCaptured] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Welcome to Stones of Italy. I'm your AI Stone Specialist. I can help you choose the right surface for Vero Beach homes (including outdoor summer kitchens), explain our 5–7 day template-to-install turnaround, and arrange a free estimate. How can I help today?" }
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  async function maybeCaptureLead(latestText: string) {
    if (captured) return;
    const intent = /estimate|callback|call me|book|appointment|measure|showroom|quote/i.test(latestText);
    if (!intent) return;
    if (!lead.name || !lead.phone) {
      setMessages(m => [...m, { role: 'assistant', content: 'I can arrange that now. Please share your Name and Phone (email optional) in the fields below, then tap "Request Callback / Estimate".' }]);
      return;
    }
    try {
      const parts = lead.name.trim().split(/\s+/);
      await fetch('/api/lead-capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0] || lead.name, lastName: parts.slice(1).join(' '),
          phone: lead.phone, email: lead.email || `${lead.phone.replace(/\D/g,'')}@placeholder.local`,
          leadSource: 'ai-chat-concierge', selectedStone: 'Consultation', projectType: 'Estimate Request',
          estimatedRange: 'To be confirmed after consultation', callMeIn30Seconds: true,
        })
      });
      setCaptured(true);
      setMessages(m => [...m, { role: 'assistant', content: 'Thank you — your request is in. Our team/AI concierge will reach out shortly to schedule your free estimate. If you need immediate help, call 772-299-7560.' }]);
    } catch {}
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      const reply = data.reply || 'How else can I assist with your countertop project?';
      setMessages([...next, { role: 'assistant', content: reply }]);
      await maybeCaptureLead(content);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'I had trouble connecting. Please call (772) 299-7560 (Mon–Fri 8am–5pm, Sat 8am–2pm) or share your name and phone so we can call you back.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function requestCallback() {
    if (!lead.name || !lead.phone) { alert('Please enter your name and phone.'); return; }
    const parts = lead.name.trim().split(/\s+/);
    setLoading(true);
    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0] || lead.name, lastName: parts.slice(1).join(' '),
          phone: lead.phone, email: lead.email || `${lead.phone.replace(/\D/g,'')}@placeholder.local`,
          leadSource: 'ai-chat-concierge', selectedStone: 'Consultation', projectType: 'Estimate/Callback Request',
          estimatedRange: 'To be confirmed', callMeIn30Seconds: true,
        })
      });
      if (!res.ok) throw new Error();
      setCaptured(true);
      setMessages(m => [...m, { role: 'assistant', content: `Thank you, ${parts[0] || 'there'}! We’ve received your request and can call you shortly to help schedule your estimate.` }]);
    } catch {
      alert('Please call (772) 299-7560 and we’ll assist right away.');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50">
      <button onClick={() => setOpen(o => !o)} className="relative group bg-obsidian border-2 border-gold text-gold p-4 shadow-2xl flex items-center gap-3 hover:bg-gold hover:text-obsidian transition-all duration-300">
        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span></span>
        <i className="bi bi-chat-dots-fill text-xl"></i>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Ask Stones of Italy • AI Stone Specialist</span>
      </button>
      {open && (
        <div className="absolute bottom-16 right-0 w-[22rem] sm:w-[26rem] glass-panel-dark border border-gold/40 shadow-2xl p-4 mb-2 flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-gold/20 mb-3">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="font-serif font-bold text-sm text-alabaster">Ask Stones of Italy • AI Stone Specialist</span></div>
            <button onClick={() => setOpen(false)} className="text-alabaster/60 hover:text-alabaster text-lg">×</button>
          </div>
          <div className="space-y-3 text-xs mb-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {messages.map((m, i) => (<div key={i} className={m.role === 'assistant' ? 'bg-slate/60 p-3 text-alabaster/90 border-l-2 border-gold whitespace-pre-wrap' : 'bg-gold/10 p-3 text-alabaster border-r-2 border-gold ml-6 whitespace-pre-wrap'}>{m.content}</div>))}
            {loading && <div className="text-alabaster/50 text-[11px]">Specialist is typing...</div>}
            <div ref={endRef} />
          </div>
          <div className="grid grid-cols-1 gap-2 mb-3 text-xs">
            <input placeholder="Name" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} className="p-2 bg-slate/60 border border-gold/30" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Phone" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})} className="p-2 bg-slate/60 border border-gold/30" />
              <input placeholder="Email (optional)" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})} className="p-2 bg-slate/60 border border-gold/30" />
            </div>
            <button onClick={requestCallback} disabled={loading} className="p-2.5 bg-gold text-obsidian font-bold uppercase tracking-wider disabled:opacity-60">Request Callback / Estimate</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about quartzite vs quartz outdoors, turnaround, stones..." className="flex-1 p-2.5 bg-slate/60 border border-gold/30 text-xs text-alabaster focus:outline-none focus:border-gold" />
            <button disabled={loading} type="submit" className="px-3 bg-gold text-obsidian text-xs font-bold uppercase disabled:opacity-60">Send</button>
          </form>
          <div className="text-[10px] text-alabaster/40 mt-2">4646 US-1, Vero Beach • 772-299-7560 • Mon–Fri 8–5, Sat 8–2 • Family-owned since 2001 (4.7★)</div>
        </div>
      )}
    </div>
  );
}
