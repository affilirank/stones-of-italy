import { NextRequest, NextResponse } from 'next/server';
import { getStoneById } from '@/lib/stones';

export const runtime = 'nodejs';

function buildPrompt(stoneName: string, stone: any) {
  return `Photorealistic countertop replacement: replace ONLY existing horizontal countertop surfaces and backsplashes in the provided kitchen/bath photo with ${stoneName} (${stone.type}). Preserve cabinets, walls, flooring, lighting, appliances, fixtures, perspective, and shadows exactly. Match realistic ${stone.sheen} sheen, exact veining (${stone.veining}), and color palette (${stone.color}). Keep edges crisp and reflections physically plausible. Do not alter layout or non-countertop elements.`;
}

async function callGemini(base64: string, mimeType: string, prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const preferred = process.env.GEMINI_IMAGE_MODEL;
  const candidates = [
    preferred,
    'gemini-3.1-flash-image-preview',
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image-preview',
  ].filter((m, i, arr): m is string => !!m && arr.indexOf(m) === i);

  let lastError: any = null;
  for (const model of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Gemini visualization failed (${model})`);
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p: any) => p.inlineData || p.inline_data);
      const inline = imgPart?.inlineData || imgPart?.inline_data;
      if (!inline?.data) throw new Error(`No image returned from Gemini (${model})`);
      return `data:${inline.mimeType || inline.mime_type || 'image/png'};base64,${inline.data}`;
    } catch (e: any) {
      lastError = e;
      // try next model on capability/input/availability errors
    }
  }
  throw lastError || new Error('Gemini visualization failed');
}

async function callReplicate(imageDataUrl: string, prompt: string) {
  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_MODEL_VERSION;
  if (!token || !version) throw new Error('REPLICATE_API_TOKEN/REPLICATE_MODEL_VERSION not configured');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, input: { prompt, image: imageDataUrl } })
  });
  let prediction = await res.json();
  if (!res.ok) throw new Error(prediction?.detail || 'Replicate prediction failed');
  while (prediction.status && !['succeeded', 'failed', 'canceled'].includes(prediction.status)) {
    await new Promise(r => setTimeout(r, 1500));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, { headers: { Authorization: `Token ${token}` } });
    prediction = await pr.json();
  }
  if (prediction.status !== 'succeeded') throw new Error(prediction.error || 'Replicate visualization failed');
  const out = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  return out as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', stoneId, prompt: customPrompt, sampleRoomUrl } = body || {};
    if (!imageBase64 && !sampleRoomUrl) {
      return NextResponse.json({ error: 'Provide imageBase64 (data URL or raw base64) or sampleRoomUrl' }, { status: 400 });
    }
    const stone = getStoneById(stoneId || 'taj-mahal-quartzite');
    const prompt = customPrompt || buildPrompt(stone.name, stone);

    let base64 = imageBase64 || '';
    let mime = mimeType;
    if (base64.startsWith('data:')) {
      const m = base64.match(/^data:(.*?);base64,(.*)$/);
      if (m) { mime = m[1]; base64 = m[2]; }
    }
    if (!base64 && sampleRoomUrl) {
      const r = await fetch(sampleRoomUrl);
      const ab = await r.arrayBuffer();
      mime = r.headers.get('content-type') || 'image/jpeg';
      base64 = Buffer.from(ab).toString('base64');
    }

    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasReplicate = !!process.env.REPLICATE_API_TOKEN && !!process.env.REPLICATE_MODEL_VERSION;
    const provider = (process.env.VISUALIZER_PROVIDER || (hasReplicate ? 'replicate' : 'gemini')).toLowerCase();

    let afterImageUrl: string | null = null;
    let mock = false;
    let note: string | undefined;
    try {
      if (provider === 'replicate' && hasReplicate) {
        afterImageUrl = await callReplicate(`data:${mime};base64,${base64}`, prompt);
      } else if (hasGemini) {
        afterImageUrl = await callGemini(base64, mime, prompt);
      } else {
        // Clean mock fallback mode if keys aren't set yet
        mock = true;
        afterImageUrl = `data:${mime};base64,${base64}`;
        note = 'Mock visualization mode: set GEMINI_API_KEY or REPLICATE_API_TOKEN/REPLICATE_MODEL_VERSION to enable AI countertop replacement.';
      }
    } catch (e: any) {
      mock = true;
      afterImageUrl = `data:${mime};base64,${base64}`;
      note = `Visualization provider fallback (${e?.message || 'unavailable'}). Showing original image in mock mode.`;
    }

    return NextResponse.json({ ok: true, afterImageUrl, beforeImageUrl: sampleRoomUrl || null, stone: { id: stone.id, name: stone.name }, promptUsed: prompt, mock, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Visualization failed' }, { status: 500 });
  }
}
