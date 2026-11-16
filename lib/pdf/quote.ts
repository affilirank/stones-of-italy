import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatCurrency, type QuoteBreakdown } from '@/lib/quote';

export type QuotePdfInput = {
  customer: { name: string; email: string; phone: string; cityZip?: string };
  quote: QuoteBreakdown & { projectScope?: string; squareFeet?: number; edgeProfile?: string; options?: any };
};

export async function generateQuotePdf(input: QuotePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let y = height - 50;
  const gold = rgb(0.77, 0.63, 0.35);

  const draw = (text: string, x: number, size = 11, f = font, color = rgb(0.1,0.1,0.1)) => {
    page.drawText(text, { x, y, size, font: f, color });
  };

  draw('Stones of Italy, Inc.', 50, 20, bold, gold); y -= 18;
  draw('4646 US-1, Vero Beach, FL 32967  |  (772) 299-7560', 50, 10, font, rgb(0.3,0.3,0.3)); y -= 10;
  draw('Mon–Fri 8am–5pm, Sat 8am–2pm  |  Vero Beach & Treasure Coast', 50, 10, font, rgb(0.3,0.3,0.3)); y -= 24;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: gold }); y -= 24;

  draw('ITEMIZED COUNTERTOP QUOTE (Estimate Range)', 50, 14, bold); y -= 20;
  draw(`Prepared for: ${input.customer.name}`, 50, 11, bold); y -= 14;
  draw(`Email: ${input.customer.email}   Phone: ${input.customer.phone}`, 50, 10); y -= 14;
  if (input.customer.cityZip) { draw(`Location: ${input.customer.cityZip}`, 50, 10); y -= 14; }
  draw(`Date: ${new Date().toLocaleString()}`, 50, 10); y -= 22;

  const q = input.quote;
  draw('Project Details', 50, 12, bold, gold); y -= 16;
  const details = [
    `Stone: ${q.stoneName} ($${q.ratePerSqFt}/sq ft installed)`,
    `Project scope: ${q.projectScope || 'N/A'}   |   Area: ${q.squareFeet ?? 'N/A'} sq ft`,
    `Edge profile: ${q.edgeProfile || 'N/A'}`,
  ];
  for (const d of details) { draw(d, 50, 10); y -= 14; }
  y -= 8;

  draw('Itemized Breakdown', 50, 12, bold, gold); y -= 16;
  const rows: [string, string][] = [
    ['Base material & installation', formatCurrency(q.baseMaterialAndInstall)],
    ['Edge upgrades', formatCurrency(q.edgeUpgrade)],
    ['Mitered waterfall upgrade', formatCurrency(q.waterfallUpgrade)],
    ['Cutouts (sink/cooktop)', formatCurrency(q.cutouts)],
    ['Tear-out & disposal', formatCurrency(q.tearOut)],
    ['Calculated baseline', formatCurrency(q.total)],
  ];
  for (const [label, val] of rows) {
    draw(label, 60, 10); draw(val, 430, 10, bold); y -= 15;
  }
  y -= 6;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.8,0.8,0.8) }); y -= 18;
  draw('Estimated Fabrication & Installation Range (Installed)', 50, 11, bold); y -= 18;
  draw(`${formatCurrency(q.rangeLow)}  —  ${formatCurrency(q.rangeHigh)}`, 50, 18, bold, gold); y -= 24;

  draw('Included', 50, 12, bold, gold); y -= 16;
  for (const inc of (q.inclusions || [])) { draw(`• ${inc}`, 60, 10); y -= 14; }
  y -= 12;

  const notes = [
    'This is an estimate range based on provided inputs. Final pricing confirmed after laser digital templating and slab selection at our Vero Beach yard.',
    'Showroom: 4646 US-1, Vero Beach, FL 32967. A concierge will follow up to schedule your free in-home measurement or slab walk.',
  ];
  draw('Notes', 50, 11, bold); y -= 14;
  for (const n of notes) {
    const words = n.split(' ');
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (test.length > 95) { draw(line, 50, 9, font, rgb(0.25,0.25,0.25)); y -= 12; line = w; }
      else line = test;
    }
    if (line) { draw(line, 50, 9, font, rgb(0.25,0.25,0.25)); y -= 12; }
    y -= 2;
  }

  return doc.save();
}
