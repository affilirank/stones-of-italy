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
      const last = messages[messages.length - 1]?.content?.toLowerCase?.() || '';
      let reply = "I can help with stone selection, durability, pricing, and booking a free in-home measurement or showroom slab walk at 4646 US-1, Vero Beach. What's your project (kitchen, bath, outdoor) and how do you use the space?";
      if (last.includes('outdoor')) reply = "For Florida outdoor kitchens, I recommend Statuario Porcelain (UV/heat/stain proof) or Taj Mahal/Sea Pearl Quartzite (durable natural stone, sealed). Quartz is not ideal in direct sun. Want me to help you book a free in-home measurement or showroom slab walk?";
      else if (last.includes('marble') && (last.includes('cook') || last.includes('kitchen'))) reply = "For heavy cooks, I recommend Taj Mahal Quartzite over marble — it gives a luxurious look with far better resistance to heat and etching. Calacatta Gold Marble is stunning for lower-use areas or bath vanities. Can I get your name and phone number to schedule a free in-home measurement or showroom visit?";
      else if (last.includes('price') || last.includes('quote')) reply = "Installed pricing in Vero Beach typically ranges from about $55–$135/sq ft depending on the stone and options. Use our Instant Quote tool for a precision installed estimate range, and I can help book a free in-home measurement. What's your name and best phone number?";
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
