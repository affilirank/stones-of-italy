import { TOP_10_STONES, getStoneById } from './stones';

export type ProjectScope = 'kitchen' | 'kitchen_island' | 'bath_vanity' | 'outdoor_kitchen' | 'fireplace_wrap';
export type EdgeProfile = 'eased' | 'beveled' | 'bullnose' | 'ogee' | 'mitered_waterfall';

export interface QuoteInput {
  projectScope: ProjectScope;
  squareFeet: number;
  stoneId: string;
  edgeProfile: EdgeProfile;
  waterfallSides?: number; // for mitered waterfall
  undermountSinkCutouts?: number;
  cooktopCutouts?: number;
  tearOutDisposal?: boolean;
}

export interface QuoteBreakdown {
  baseMaterialAndInstall: number;
  edgeUpgrade: number;
  waterfallUpgrade: number;
  cutouts: number;
  tearOut: number;
  total: number;
  rangeLow: number;
  rangeHigh: number;
  ratePerSqFt: number;
  stoneName: string;
  inclusions: string[];
}

const SCOPE_FACTORS: Record<ProjectScope, number> = {
  kitchen: 1,
  kitchen_island: 1.08,
  bath_vanity: 0.95,
  outdoor_kitchen: 1.12,
  fireplace_wrap: 0.9,
};

export const PROJECT_TYPE_LABELS: Record<ProjectScope, string> = {
  kitchen: 'Kitchen',
  kitchen_island: 'Kitchen + Island',
  bath_vanity: 'Bathroom Vanity',
  outdoor_kitchen: 'Outdoor Summer Kitchen',
  fireplace_wrap: 'Fireplace Wrap',
};

export const ROOM_PRESETS = [
  { label: 'Small', sqFt: 30 },
  { label: 'Medium', sqFt: 50 },
  { label: 'Large', sqFt: 75 },
  { label: 'Estate', sqFt: 100 },
];

export function estimateLinearFeet(sqFt: number, scope: ProjectScope): number {
  // heuristic: perimeter/edge linear footage approximation
  const base = Math.sqrt(sqFt) * 4;
  if (scope === 'kitchen_island') return base * 1.2;
  if (scope === 'bath_vanity') return base * 0.8;
  if (scope === 'fireplace_wrap') return base * 0.7;
  return base;
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const stone = getStoneById(input.stoneId);
  const sqFt = Math.max(1, input.squareFeet);
  const scopeFactor = SCOPE_FACTORS[input.projectScope] ?? 1;
  const rate = stone.installedRateSqFt;
  const baseMaterialAndInstall = Math.round(sqFt * rate * scopeFactor);

  const lnFt = estimateLinearFeet(sqFt, input.projectScope);
  let edgeUpgrade = 0;
  let waterfallUpgrade = 0;
  // Edge Profile (Eased/Beveled standard, Bullnose/Ogee +$12/ln ft, Mitered Waterfall +$450/side)
  if (input.edgeProfile === 'bullnose' || input.edgeProfile === 'ogee') {
    edgeUpgrade = Math.round(lnFt * 12);
  } else if (input.edgeProfile === 'mitered_waterfall') {
    const sides = Math.max(1, input.waterfallSides ?? 1);
    waterfallUpgrade = sides * 450;
  }
  // Eased/Beveled standard = $0

  const sinkCount = input.undermountSinkCutouts ?? 0;
  const cooktopCount = input.cooktopCutouts ?? 0;
  const cutouts = sinkCount * 250 + cooktopCount * 200;
  const tearOut = input.tearOutDisposal ? 350 : 0;

  const total = baseMaterialAndInstall + edgeUpgrade + waterfallUpgrade + cutouts + tearOut;
  const rangeLow = Math.round((total - 750) / 100) * 100;
  const rangeHigh = Math.round((total + 750) / 100) * 100;

  return {
    baseMaterialAndInstall,
    edgeUpgrade,
    waterfallUpgrade,
    cutouts,
    tearOut,
    total,
    rangeLow,
    rangeHigh,
    ratePerSqFt: rate,
    stoneName: stone.name,
    inclusions: [
      'Laser templating',
      'Custom fabrication',
      'Edge profiling',
      'Professional installation',
    ],
  };
}

export function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
