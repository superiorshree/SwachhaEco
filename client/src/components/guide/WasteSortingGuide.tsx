import React, { useState } from 'react';
import { Check, X, AlertCircle, Leaf, Recycle, Package, Laptop, Activity, Trash2 } from 'lucide-react';
import { WasteCategory } from '../../types';

interface GuideCategory {
  id: WasteCategory;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  color: string;
  belongs: string[];
  doesNotBelong: string[];
  tips: string;
}

const CATEGORIES: GuideCategory[] = [
  {
    id: 'Organic',
    name: 'Organic & Compostable',
    icon: Leaf,
    tagline: 'Biodegradable wet waste and plant matter',
    color: '#16793f',
    belongs: [
      'Fruit & vegetable peels, food scraps',
      'Tea bags, coffee grounds, eggshells',
      'Yard trimmings, dry leaves, flowers',
      'Compostable paper food liners'
    ],
    doesNotBelong: [
      'Plastic wrappers, takeout cling wrap',
      'Treated or painted wood',
      'Bones or dairy in large quantities',
      'Pet feces or cat litter'
    ],
    tips: 'Keep organic waste drained of excess liquid before bagging in biodegradable or paper bags.'
  },
  {
    id: 'Plastic',
    name: 'Plastics & Polymers',
    icon: Recycle,
    tagline: 'Clean, rigid, and recyclable plastic containers',
    color: '#239a4e',
    belongs: [
      'PET beverage bottles (#1), milk jugs (#2)',
      'Clean shampoo & detergent bottles',
      'Rigid plastic tubs & food containers (PP #5)',
      'Plastic caps & rings (rinsed)'
    ],
    doesNotBelong: [
      'Single-use thin grocery film / polythene bags',
      'Expanded polystyrene (styrofoam)',
      'Multi-layer chip bags & metallic foil pouches',
      'Heavily soiled or greasy containers'
    ],
    tips: 'Rinse all food residue with minimal water. Residual sugars attract pests and contaminate processing batches.'
  },
  {
    id: 'Paper',
    name: 'Paper & Cardboard',
    icon: Package,
    tagline: 'Clean, dry fibers and packaging cardboard',
    color: '#75cf5e',
    belongs: [
      'Corrugated cardboard boxes (flattened)',
      'Newspapers, magazines, office paper',
      'Cereal & dry food boxes (liners removed)',
      'Clean paper grocery bags & envelopes'
    ],
    doesNotBelong: [
      'Greasy pizza boxes with cheese/oil stains',
      'Wax-coated thermal receipts',
      'Used napkins, tissues, paper towels',
      'Foil-lined laminated gift wrap'
    ],
    tips: 'Break down and flatten all cardboard boxes. Tie in bundles or pack inside a paper bag.'
  },
  {
    id: 'E-Waste',
    name: 'Electronic Waste (E-Waste)',
    icon: Laptop,
    tagline: 'Appliances, circuit boards, batteries, and peripherals',
    color: '#dc2626',
    belongs: [
      'Laptops, desktop towers, circuit boards',
      'Smartphones, chargers, USB cords, adapters',
      'Small kitchen appliances (toasters, blenders)',
      'Rechargeable batteries (terminals taped)'
    ],
    doesNotBelong: [
      'Cracked mercury thermometers',
      'Explosive or bloated swollen lithium batteries',
      'Household alkaline single-use batteries (in bulk)',
      'Commercial industrial machinery'
    ],
    tips: 'Always tape over lithium battery terminals with electrical or scotch tape to prevent spark hazards.'
  },
  {
    id: 'Medical',
    name: 'Medical & Bio-Waste',
    icon: Activity,
    tagline: 'Household pharmaceutical and clinical consumables',
    color: '#b91c1c',
    belongs: [
      'Expired prescription pills & blister packs',
      'Dry non-infectious sterile packaging',
      'Uncontaminated PPE masks & examination gloves',
      'Over-the-counter medicine bottles'
    ],
    doesNotBelong: [
      'Loose uncovered hypodermic needles or lancets',
      'Active pathological or blood-soaked infectious dressings',
      'Hazardous radioactive diagnostic contrast agents',
      'Standard non-medical household trash'
    ],
    tips: 'Place all sharps in rigid, puncture-proof plastic containers clearly sealed before requesting specialized clinical pickup.'
  },
  {
    id: 'Other',
    name: 'Bulky & Specialty Waste',
    icon: Trash2,
    tagline: 'Mixed textiles, broken glass, ceramic, and metal items',
    color: '#1c211e',
    belongs: [
      'Broken glass or ceramics (securely wrapped)',
      'Old apparel, textiles, blankets (dry)',
      'Aluminum beverage cans, clean tin tins',
      'Small dismantled household hardware'
    ],
    doesNotBelong: [
      'Wet moldy carpets or asbestos insulation',
      'Hazardous solvents, paint cans, thinners',
      'Automotive motor oils and brake fluids',
      'Pressurized gas cylinders or propane tanks'
    ],
    tips: 'Wrap broken glass in several layers of newspaper and mark visibly to protect collector safety during handling.'
  }
];

export default function WasteSortingGuide() {
  const [selectedCat, setSelectedCat] = useState<WasteCategory>('Organic');
  const activeCategory = CATEGORIES.find(c => c.id === selectedCat) || CATEGORIES[0];
  const ActiveIcon = activeCategory.icon;

  return (
    <div className="space-y-8">
      {/* Editorial Header per Design.md */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6 sm:p-8">
        <span className="text-[12px] font-semibold text-primary uppercase tracking-wider block mb-1">
          Civic Solid Waste Directorate
        </span>
        <h1 className="text-[34px] sm:text-[40px] font-semibold tracking-tight text-ink leading-tight">
          Doorstep Waste Segregation Guidelines • SWM Rules 2016
        </h1>
        <p className="text-[17px] text-ink-muted80 mt-2 max-w-[720px] leading-relaxed">
          Mandatory source segregation manual for households under Solid Waste Management (SWM 2016) rules and curbside collection norms.
        </p>

        {/* 6 Category Pills */}
        <div className="flex flex-wrap gap-2.5 mt-6 pt-6 border-t border-border-soft">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat.id;
            const CategoryIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-pill text-[14px] font-medium transition-all ${
                  isSelected
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-canvas-parchment text-ink-muted80 hover:bg-canvas border border-border-hairline'
                }`}
              >
                <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                <span>{cat.name.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Deep Dive Card */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6 sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-border-soft">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-pill bg-canvas-parchment border border-border-hairline flex items-center justify-center">
                <ActiveIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-[28px] font-semibold tracking-tight text-ink">
                {activeCategory.name}
              </h2>
            </div>
            <p className="text-[14px] text-ink-muted48 mt-1">
              {activeCategory.tagline}
            </p>
          </div>
        </div>

        {/* Two-column comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* What Belongs */}
          <div className="p-5 rounded-lg bg-emerald-50/50 border border-[#16793f]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#16793f] font-semibold text-[15px]">
              <div className="w-5 h-5 rounded-full bg-[#16793f] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>What Belongs</span>
            </div>
            <ul className="space-y-2.5 text-[14px] text-ink">
              {activeCategory.belongs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#16793f] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Does NOT Belong */}
          <div className="p-5 rounded-lg bg-red-50/50 border border-[#dc2626]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#dc2626] font-semibold text-[15px]">
              <div className="w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center">
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>What Does NOT Belong</span>
            </div>
            <ul className="space-y-2.5 text-[14px] text-ink">
              {activeCategory.doesNotBelong.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#dc2626] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pro Tip Box */}
        <div className="mt-6 p-4 rounded-md bg-surface-pearl border border-border-soft flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-[13px]">
            <strong className="text-ink font-semibold">Municipal Advisory: </strong>
            <span className="text-ink-muted80">{activeCategory.tips}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
