

export interface CategoryColor {
  bg: string; 
  text: string; 
  dot: string;
  softBorder: string;
}

const PALETTE: CategoryColor[] = [
  { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', softBorder: 'border-rose-100' },
  { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', softBorder: 'border-blue-100' },
  { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500', softBorder: 'border-violet-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', softBorder: 'border-emerald-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', softBorder: 'border-amber-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500', softBorder: 'border-cyan-100' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', dot: 'bg-fuchsia-500', softBorder: 'border-fuchsia-100' },
  { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500', softBorder: 'border-indigo-100' },
  { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500', softBorder: 'border-teal-100' },
  { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', softBorder: 'border-orange-100' },
];

// Well-known categories get a hand-picked color; everything else is hashed to a
// stable palette entry so the same name always maps to the same color.
const NAMED: Record<string, number> = {
  fashion: 0, clothing: 0, wear: 0, apparel: 0,
  gadgets: 1, electronics: 1, phones: 1, tech: 1, computing: 1,
  beauty: 2, 'beauty & care': 2, cosmetics: 2, skincare: 2, 'health & beauty': 2,
  home: 8, 'home & living': 8, furniture: 8, kitchen: 8,
  groceries: 3, food: 3, farm: 3, foodstuff: 3, drinks: 3,
  jewelry: 6, jewellery: 6, accessories: 6, watches: 6,
  sports: 5, fitness: 5, outdoor: 5,
  books: 7, stationery: 7, education: 7,
  services: 4, general: 9, other: 9,
};

export function categoryColor(category?: string): CategoryColor {
  const key = (category || '').trim().toLowerCase();
  if (!key) return PALETTE[9];
  if (key in NAMED) return PALETTE[NAMED[key]];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
