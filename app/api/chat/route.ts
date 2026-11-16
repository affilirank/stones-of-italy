import { NextRequest, NextResponse } from 'next/server';

const BUSINESS_KB = `
You are "Stones of Italy AI Sales Concierge" for Stones of Italy, Inc.
Business: 4646 US-1, Vero Beach, FL 32967. Phone: 772-299-7560. Hours: Mon-Fri 8am-5pm, Sat 8am-2pm. Service: Vero Beach, John's Island, Orchid Island, Sebastian, Hutchinson Island, Fort Pierce, Treasure Coast. Licensed & Insured #CBC1264821. 25+ years in Vero Beach, 4.7★ (127+ Google reviews), laser digital templating, in-house fabrication, 5-7 day delivery/fast turnaround.

Products: Quartzite, Marble, Quartz, Porcelain, Granite, Dolomite. Top 10 stones: Taj Mahal Quartzite (durable, great for kitchens/outdoor), Calacatta Gold Marble (luxury, more maintenance), Calacatta Laza Quartz (low maintenance), Carrara Gioia Marble (classic, honed), Bianco Romano Granite (durable value), Sea Pearl Quartzite (coastal look), Statuario Porcelain (zero porosity, UV/heat/stain proof, excellent outdoors), Black Galaxy Granite (dramatic), Super White Dolomite (elegant, durable), Azul Macaubas Quartzite (exotic).

Care/Durability guidance for Florida: 
- Quartzite (e.g. Taj Mahal, Sea Pearl, Azul Macaubas): natural stone, very heat/scratch resistant, good for heavy cooks and some outdoor applications when properly sealed.
- Quartz (engineered): non-porous, low maintenance, great for busy kitchens/baths; not recommended for direct prolonged UV/outdoor sun exposure (can discolor/warp) - suggest porcelain or quartzite for outdoor kitchens.
- Marble (Calacatta Gold, Carrara): luxurious but softer/porous; can etch/stain with acids; recommend for vanities, baking areas with care, not ideal for heavy-cook or outdoor kitchens. Recommend Taj Mahal Quartzite over Marble for heavy cooks.
- Porcelain slabs (Statuario): impervious to heat, UV rays, stains; excellent for Florida outdoor kitchens, fireplaces, high-use areas.
- Granite/Dolomite: durable; sealing recommended.

Pricing tiers (installed, Vero Beach realistic): approx $55–$135/sq ft depending on material tier/selection, plus options (edge upgrades, cutouts, tear-out). Always offer the Instant Quote tool for a precision installed estimate range.

Goals (sales-oriented): answer material questions clearly; recommend slabs based on lifestyle (outdoor Florida kitchens -> porcelain/quartzite; heavy cooks -> quartzite/quartz over marble; luxury bath vanity -> marble or quartzite); capture phone and/or email when helpful; push visitors to book a free in-home measurement or showroom slab walk at 4646 US-1. 
If user shows buying intent, ask for name, phone, email and preferred time to book a free in-home measurement or showroom visit. When you collect contact info, summarize it clearly. Be concise, warm, premium, and helpful. Never invent unavailable inventory promises; encourage slab viewing in yard.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback rule-based response if no LLM key
      const last = (messages[messages.length - 1]?.content || '').toLowerCase();

      const hours = "Our showroom hours are Monday–Friday 8:00 AM–5:00 PM and Saturday 8:00 AM–2:00 PM (closed Sunday).";
      const location = "We're located at 4646 US-1, Vero Beach, FL 32967.";
      const phone = "You can reach us at (772) 299-7560.";

      let reply = "I can help with stone selection, durability, pricing, hours, and booking a free in-home measurement or showroom slab walk at 4646 US-1, Vero Beach. What's your project (kitchen, bath, or outdoor), and how do you use the space?";

      if (/\b(hour|hours|open|close|closing|closed|today|tomorrow|saturday|sunday|weekend|time)\b/.test(last)) {
        reply = `${hours} ${location} ${phone} Would you like to schedule a showroom visit or a free in-home estimate?`;
      } else if (/\b(where|address|location|directions|located|showroom)\b/.test(last)) {
        reply = `${location} ${hours} ${phone} You're welcome to stop by the showroom to view slabs in person.`;
      } else if (/\b(phone|call|number|contact|reach)\b/.test(last)) {
        reply = `${phone} ${hours} ${location} If you'd like, share your name and number here and I can arrange a quick callback/free estimate.`;
      } else if (/\b(turnaround|how long|timeline|install|installation|template|templating|fabricat)\b/.test(last)) {
        reply = "Most projects are completed in about 5–7 days from laser templating to professional installation (timing can vary by material and project scope). We handle laser templating, custom in-house fabrication, edge profiling, and professional installation. Want me to help you get a precision estimate?";
      } else if (/\b(outdoor|outside|patio|bbq|summer kitchen|uv|sun)\b/.test(last)) {
        reply = "For Florida outdoor kitchens, I recommend Statuario Porcelain (UV/heat/stain resistant) or durable quartzites like Taj Mahal or Sea Pearl (properly sealed). Quartz is not ideal for direct prolonged sun exposure. Would you like a recommendation based on your style and maintenance preference?";
      } else if (/\b(marble)\b/.test(last) && /\b(cook|kitchen|heavy|etch|stain)\b/.test(last)) {
        reply = "For heavy cooks, I usually recommend Taj Mahal Quartzite over marble — it offers a similar luxurious look with much better resistance to heat and etching. Calacatta Gold or Carrara marble is beautiful for lower-use areas or bath vanities. Can I help you compare options or book a free estimate?";
      } else if (/\b(quartzite|quartz|granite|porcelain|dolomite|stone|material|slab)\b/.test(last)) {
        reply = "We carry premium quartzite, marble, quartz, granite, porcelain, and dolomite. Popular choices include Taj Mahal Quartzite (durable, great for kitchens/outdoors), Calacatta Gold Marble (luxury), Calacatta Laza Quartz (low maintenance), Sea Pearl Quartzite (coastal), and Statuario Porcelain (excellent for outdoor/UV). Tell me your space (kitchen, bath, or outdoor) and how you use it, and I’ll recommend the best fit.";
      } else if (/\b(price|pricing|cost|quote|estimate|budget|how much)\b/.test(last)) {
        reply = "Installed pricing in Vero Beach typically ranges from about $60–$135/sq ft depending on the stone and project details (edges, cutouts, tear-out, etc.). For the most accurate number, use our Precision Countertop Project Estimator on this page for an installed range, and I can also help arrange a free in-home measurement. What type of project are you planning?";
      } else if (/\b(appointment|book|schedule|visit|measure|measurement|consult)\b/.test(last)) {
        reply = `We’d be happy to help with a free in-home measurement or showroom visit. ${location} ${hours} ${phone} If you share your name and phone number here, I can arrange a quick callback for you.`;
      } else if (/\b(services|do you|fabricat|template|install|remodel)\b/.test(last)) {
        reply = "We provide custom countertop solutions including laser templating, in-house fabrication, edge profiling, and professional installation for kitchens, baths, vanities, and outdoor spaces across the Treasure Coast. Most projects are completed in about 5–7 days from template to install. What are you working on?";
      }

      return NextResponse.json({ reply, fallback: true });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: BUSINESS_KB },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Chat completion failed');
    const reply = data.choices?.[0]?.message?.content || 'How can I help with your countertop project today?';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}
