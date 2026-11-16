import { NextRequest, NextResponse } from 'next/server';
import { generateQuotePdf } from '@/lib/pdf/quote';
import { calculateQuote, type ProjectScope, type EdgeProfile } from '@/lib/quote';

function decodePayload(encoded: string) {
  const json = Buffer.from(encoded, 'base64url').toString('utf8');
  return JSON.parse(json);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = searchParams.get('data');
    if (!data) return NextResponse.json({ error: 'data query param required' }, { status: 400 });
    const body = decodePayload(data);
    const { customer, quote, quoteInput } = body;
    let q = quote;
    if (!q && quoteInput) {
      q = calculateQuote({
        projectScope: (quoteInput.projectScope || 'kitchen') as ProjectScope,
        squareFeet: Number(quoteInput.squareFeet || 50),
        stoneId: quoteInput.stoneId || 'taj-mahal-quartzite',
        edgeProfile: (quoteInput.edgeProfile || 'eased') as EdgeProfile,
        waterfallSides: quoteInput.waterfallSides,
        undermountSinkCutouts: quoteInput.undermountSinkCutouts,
        cooktopCutouts: quoteInput.cooktopCutouts,
        tearOutDisposal: !!quoteInput.tearOutDisposal,
      });
      q = { ...q, projectScope: quoteInput.projectScope, squareFeet: quoteInput.squareFeet, edgeProfile: quoteInput.edgeProfile };
    }
    if (!customer?.name || !customer?.email || !customer?.phone || !q) {
      return NextResponse.json({ error: 'customer (name,email,phone) and quote or quoteInput required' }, { status: 400 });
    }
    const bytes = await generateQuotePdf({ customer, quote: q });
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Stones-of-Italy-Quote-${customer.name.replace(/[^a-z0-9]+/gi,'-')}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'PDF generation failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, quote, quoteInput } = body;
    let q = quote;
    if (!q && quoteInput) {
      q = calculateQuote({
        projectScope: (quoteInput.projectScope || 'kitchen') as ProjectScope,
        squareFeet: Number(quoteInput.squareFeet || 50),
        stoneId: quoteInput.stoneId || 'taj-mahal-quartzite',
        edgeProfile: (quoteInput.edgeProfile || 'eased') as EdgeProfile,
        waterfallSides: quoteInput.waterfallSides,
        undermountSinkCutouts: quoteInput.undermountSinkCutouts,
        cooktopCutouts: quoteInput.cooktopCutouts,
        tearOutDisposal: !!quoteInput.tearOutDisposal,
      });
      q = { ...q, projectScope: quoteInput.projectScope, squareFeet: quoteInput.squareFeet, edgeProfile: quoteInput.edgeProfile };
    }
    if (!customer?.name || !customer?.email || !customer?.phone || !q) {
      return NextResponse.json({ error: 'customer (name,email,phone) and quote or quoteInput required' }, { status: 400 });
    }
    const bytes = await generateQuotePdf({ customer, quote: q });
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Stones-of-Italy-Quote-${customer.name.replace(/[^a-z0-9]+/gi,'-')}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'PDF generation failed' }, { status: 500 });
  }
}
