import fs from 'fs/promises';
import path from 'path';

const stones = [
  { id: 'taj-mahal-quartzite', name: 'Taj Mahal Quartzite', type: 'Quartzite', color: 'warm ivory beige cream', veining: 'soft flowing amber-beige and gold veins', details: 'Brazilian quartzite, elegant translucent look' },
  { id: 'calacatta-gold-marble', name: 'Calacatta Gold Marble', type: 'Marble', color: 'bright white background', veining: 'bold dramatic gold and grey ribbons', details: 'Italian Calacatta marble, luxury slab' },
  { id: 'calacatta-laza-quartz', name: 'Calacatta Laza Quartz', type: 'Quartz', color: 'milky white', veining: 'dramatic soft grey movement, Calacatta-style', details: 'engineered quartz slab, clean polished surface' },
  { id: 'carrara-gioia-marble', name: 'Carrara Gioia Marble', type: 'Marble', color: 'soft white to light grey', veining: 'fine soft grey clouds and delicate veins', details: 'classic Carrara marble, honed/polished look' },
  { id: 'bianco-romano-granite', name: 'Bianco Romano Granite', type: 'Granite', color: 'white and grey base', veining: 'speckled crystalline pattern with subtle burgundy/garnet mineral flecks', details: 'Brazilian granite slab' },
  { id: 'sea-pearl-quartzite', name: 'Sea Pearl Quartzite', type: 'Quartzite', color: 'sage green, grey, and soft silver', veining: 'linear coastal flowing movement', details: 'coastal Brazilian quartzite slab' },
  { id: 'statuario-porcelain', name: 'Statuario Porcelain', type: 'Porcelain', color: 'crisp white', veining: 'bold grey Statuario-style veins', details: 'large format Italian porcelain slab, ultra smooth' },
  { id: 'black-galaxy-granite', name: 'Black Galaxy Granite', type: 'Granite', color: 'deep black', veining: 'dense golden and copper metallic speckles', details: 'Indian granite slab, polished mirror finish' },
  { id: 'super-white-dolomite', name: 'Super White Dolomite', type: 'Dolomite', color: 'cool white and light grey', veining: 'sweeping grey movement with subtle depth', details: 'Brazilian dolomite/quartzite-like slab' },
  { id: 'azul-macaubas-quartzite', name: 'Azul Macaubas Quartzite', type: 'Quartzite', color: 'blue, teal, and sea-green tones', veining: 'dramatic linear blue striations', details: 'exotic Brazilian blue quartzite slab' },
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const outDir = path.join(process.cwd(), 'public', 'stones');
await fs.mkdir(outDir, { recursive: true });

for (const stone of stones) {
  const prompt = `Photorealistic HD close-up photograph of a ${stone.name} ${stone.type} countertop slab. Colors: ${stone.color}. Veining/pattern: ${stone.veining}. ${stone.details}. Full-frame macro slab surface, natural stone texture detail, polished finish, professional showroom lighting, no countertop edges, no sink, no cabinets, no text, no watermark.`;
  console.log('Generating', stone.id);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Failed', stone.id, data?.error || data);
    continue;
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData || p.inline_data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline?.data) {
    console.error('No image for', stone.id, JSON.stringify(data).slice(0,300));
    continue;
  }
  const mime = inline.mimeType || inline.mime_type || 'image/png';
  const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png';
  const buf = Buffer.from(inline.data, 'base64');
  const file = path.join(outDir, `${stone.id}.${ext}`);
  await fs.writeFile(file, buf);
  console.log('Saved', file, buf.length);
}
console.log('Done. Update lib/stones.ts image paths to /stones/<id>.<ext> as generated.');
