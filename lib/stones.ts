export type Stone = {
  id: string;
  name: string;
  type: 'Quartzite' | 'Marble' | 'Quartz' | 'Granite' | 'Porcelain' | 'Dolomite';
  description: string;
  sheen: 'polished' | 'honed';
  color: string;
  veining: string;
  installedRateSqFt: number; // realistic Vero Beach installed rate
  heatRating: string;
  scratchRating: string;
  outdoorUvSafe: boolean;
  bestFor: string[];
  origin: string;
  image: string;
};

export const TOP_10_STONES: Stone[] = [
  { id: 'taj-mahal-quartzite', name: 'Taj Mahal Quartzite', type: 'Quartzite', description: 'Warm ivory with soft beige and amber veining; highly durable for kitchens and outdoor use.', sheen: 'polished', color: 'warm ivory/beige', veining: 'soft flowing amber-beige', installedRateSqFt: 115, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Kitchens', 'Waterfall islands', 'Outdoor kitchens'], origin: 'Brazil', image: '/stones/taj-mahal-quartzite.png' },
  { id: 'calacatta-gold-marble', name: 'Calacatta Gold Marble', type: 'Marble', description: 'Iconic Italian marble with bold gold and grey veining on a bright white field.', sheen: 'polished', color: 'bright white', veining: 'bold gold and grey ribbons', installedRateSqFt: 125, heatRating: 'Very Good', scratchRating: 'Moderate', outdoorUvSafe: false, bestFor: ['Bath vanities', 'Statement backsplashes', 'Low-traffic luxury'], origin: 'Carrara, Italy', image: '/stones/calacatta-gold-marble.png' },
  { id: 'calacatta-laza-quartz', name: 'Calacatta Laza Quartz', type: 'Quartz', description: 'Engineered quartz with dramatic Calacatta movement and low maintenance.', sheen: 'polished', color: 'milky white', veining: 'dramatic soft grey movement', installedRateSqFt: 85, heatRating: 'Good', scratchRating: 'Very Good', outdoorUvSafe: false, bestFor: ['Busy kitchens', 'Baths', 'Low maintenance interiors'], origin: 'Engineered', image: '/stones/calacatta-laza-quartz.png' },
  { id: 'carrara-gioia-marble', name: 'Carrara Gioia Marble', type: 'Marble', description: 'Classic Carrara with soft grey veining and timeless elegance.', sheen: 'honed', color: 'soft white/grey', veining: 'fine soft grey clouds', installedRateSqFt: 75, heatRating: 'Very Good', scratchRating: 'Moderate', outdoorUvSafe: false, bestFor: ['Bath vanities', 'Fireplace surrounds', 'Classic interiors'], origin: 'Carrara, Italy', image: '/stones/carrara-gioia-marble.png' },
  { id: 'bianco-romano-granite', name: 'Bianco Romano Granite', type: 'Granite', description: 'White and grey granite with burgundy mineral flecks; durable and versatile.', sheen: 'polished', color: 'white/grey', veining: 'speckled with subtle burgundy accents', installedRateSqFt: 65, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Value kitchens', 'Outdoor kitchens', 'High-use areas'], origin: 'Brazil', image: '/stones/bianco-romano-granite.png' },
  { id: 'sea-pearl-quartzite', name: 'Sea Pearl Quartzite', type: 'Quartzite', description: 'Coastal sage-green and grey tones with elegant movement, great for Florida homes.', sheen: 'polished', color: 'sage green/grey', veining: 'linear coastal movement', installedRateSqFt: 105, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Coastal kitchens', 'Outdoor summer kitchens', 'Islands'], origin: 'Brazil', image: '/stones/sea-pearl-quartzite.png' },
  { id: 'statuario-porcelain', name: 'Statuario Porcelain', type: 'Porcelain', description: 'Ultra-compact porcelain slab with Statuario look; UV/heat/stain resistant.', sheen: 'polished', color: 'crisp white', veining: 'bold grey Statuario veining', installedRateSqFt: 95, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Outdoor summer kitchens', 'Fireplaces', 'High-use surfaces'], origin: 'Verona, Italy', image: '/stones/statuario-porcelain.png' },
  { id: 'black-galaxy-granite', name: 'Black Galaxy Granite', type: 'Granite', description: 'Deep black granite with golden/copper flecks for dramatic contrast.', sheen: 'polished', color: 'deep black', veining: 'golden copper speckles', installedRateSqFt: 70, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Dramatic kitchens', 'Outdoor bars', 'Accent islands'], origin: 'India', image: '/stones/black-galaxy-granite.png' },
  { id: 'super-white-dolomite', name: 'Super White Dolomite', type: 'Dolomite', description: 'Cool white and grey with quartzite-like durability and marble-like elegance.', sheen: 'honed', color: 'cool white', veining: 'sweeping grey movement', installedRateSqFt: 90, heatRating: 'Very Good', scratchRating: 'Very Good', outdoorUvSafe: false, bestFor: ['Elegant kitchens', 'Baths', 'Waterfalls (indoor)'], origin: 'Brazil', image: '/stones/super-white-dolomite.png' },
  { id: 'azul-macaubas-quartzite', name: 'Azul Macaubas Quartzite', type: 'Quartzite', description: 'Exotic Brazilian blue quartzite with dramatic linear veining.', sheen: 'polished', color: 'blue/teal', veining: 'dramatic linear blue striations', installedRateSqFt: 135, heatRating: 'Excellent', scratchRating: 'Excellent', outdoorUvSafe: true, bestFor: ['Statement islands', 'Luxury kitchens', 'Feature walls'], origin: 'Brazil', image: '/stones/azul-macaubas-quartzite.png' },
];

export const SAMPLE_ROOMS = [
  { id: 'vero-coastal-kitchen', label: 'Vero Beach Coastal Kitchen', image: 'https://media.clicksites.ai/clicksites/uploads/3362/ultra_luxury_modern_kitchen_in_6d56718ddbeccdb7b307eca9bf3140ad.png' },
  { id: 'vero-transitional-kitchen', label: 'Vero Beach Transitional Kitchen', image: 'https://media.clicksites.ai/clicksites/uploads/3362/modern_luxury_kitchen_featurin_f0c815fa13776b86da76c2d178c98d80.png' },
  { id: 'vero-classic-kitchen', label: 'Vero Beach Classic Kitchen', image: 'https://media.clicksites.ai/clicksites/uploads/3362/outdated_1990s_kitchen_with_wo_e2f1ee8cbc77fc2fdb26a5ebf7dce5b3.png' },
];

export function getStoneById(id: string) {
  return TOP_10_STONES.find(s => s.id === id) || TOP_10_STONES[0];
}
