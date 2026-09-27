import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Leaf, 
  Recycle, 
  Package, 
  Laptop, 
  Activity, 
  Trash2, 
  Truck, 
  ShieldCheck, 
  Award, 
  Users, 
  ArrowRight, 
  MessageSquare, 
  Share2, 
  Clock, 
  Building2,
  FileText,
  MapPin,
  Sparkles
} from 'lucide-react';
import GreenWasteLogo from '../common/GreenWasteLogo';
import { User, RequestItem } from '../../types';

interface NationalPortalLandingProps {
  currentUser: User | null;
  requests: RequestItem[];
  onOpenCreateModal: () => void;
  onNavigateTab: (tab: 'requests' | 'guide' | 'collector' | 'admin') => void;
  onSelectCategory?: (category: string) => void;
}

const HERO_BACKGROUNDS = [
  {
    title: 'Recycling Stream Materials & Sustainable Circular Action',
    url: '/hero-bg-1.png'
  },
  {
    title: 'Eco-Green Waste Tree Symbol',
    url: '/hero-bg-2.png'
  },
  {
    title: 'Evergreen Circular Resource Recovery Network',
    url: '/hero-bg-3.jpg'
  }
];

export default function NationalPortalLanding({
  currentUser,
  requests,
  onOpenCreateModal,
  onNavigateTab,
  onSelectCategory
}: NationalPortalLandingProps) {
  const [bgIndex, setBgIndex] = useState(0);

  // Automatically cycle through background images every 4.5 seconds with low opacity
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Stats computed from real requests + municipal baseline
  const totalDoorstepPickups = 14820 + requests.length;
  const verifiedHouseholds = 3450 + (currentUser?.verified ? 1 : 0);

  const trendingTags = [
    { label: 'Schedule Doorstep Pickup', icon: Truck, primary: true, action: () => onOpenCreateModal() },
    { label: 'E-Waste Special Drive', icon: Laptop, primary: false, action: () => { onSelectCategory?.('E-Waste'); onNavigateTab('guide'); } },
    { label: 'Swachhata Credit Points', icon: Award, primary: false, action: () => onNavigateTab('requests') },
    { label: 'Plastic Sorting Guidelines', icon: Recycle, primary: false, action: () => { onSelectCategory?.('Plastic'); onNavigateTab('guide'); } }
  ];

  return (
    <div className="relative -mt-8 -mx-4 sm:-mx-6 space-y-12 pb-16 overflow-hidden">
      {/* 1. Grand Atmospheric Dusk Hero Section with Rotating Low-Opacity Backgrounds */}
      <section className="relative min-h-[540px] sm:min-h-[580px] bg-gradient-to-b from-[#0a1931] via-[#102042] to-[#1c183d] text-white flex flex-col items-center justify-start pt-12 sm:pt-16 pb-24 px-4 text-center overflow-hidden">
        
        {/* Rotating Low-Opacity Background Image Slideshow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {HERO_BACKGROUNDS.map((bg, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-all ease-in-out ${
                idx === bgIndex ? 'opacity-20 scale-105' : 'opacity-0 scale-100'
              }`}
              style={{ 
                backgroundImage: `url(${bg.url})`,
                transitionDuration: '1200ms'
              }}
              aria-hidden="true"
            />
          ))}

          {/* Vignette & Gradient Overlay to preserve deep night-blue contrast and text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1931]/80 via-[#102042]/85 to-[#1c183d]/95" />
        </div>

        {/* Architectural Monument Silhouette (India Gate / Shaniwar Wada Civic Grandeur) */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center opacity-25 select-none overflow-hidden">
          <svg
            className="w-full max-w-[1280px] h-[340px] sm:h-[440px] object-cover"
            viewBox="0 0 1000 450"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Monument Pillared Archway */}
            <path
              d="M320 450V160H360V140H400V120H600V140H640V160H680V450H600V300C600 244.772 555.228 200 500 200C444.772 200 400 244.772 400 300V450H320Z"
              fill="#060c18"
            />
            {/* Monument Attic Cornice */}
            <rect x="360" y="80" width="280" height="40" fill="#040810" />
            <rect x="380" y="60" width="240" height="20" fill="#020408" />
            <rect x="420" y="45" width="160" height="15" fill="#020408" />
            {/* Soft Green Ambient Backlight behind the Arch */}
            <ellipse cx="500" cy="280" rx="110" ry="140" fill="#16793f" fillOpacity="0.25" />
            <circle cx="500" cy="100" r="14" fill="#ffffff" fillOpacity="0.1" />
            {/* Distant City Skyline Silhouettes */}
            <path d="M0 450L0 380H120L150 400H280L320 450Z" fill="#030712" fillOpacity="0.8" />
            <path d="M680 450L720 395H860L900 410H1000V450Z" fill="#030712" fillOpacity="0.8" />
          </svg>
        </div>

        {/* Ambient Subtle Starry Sky Dust */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[880px] w-full mx-auto flex flex-col items-center">
          
          {/* Centered Green Waste Logo */}
          <div className="mb-4 flex flex-col items-center animate-fade-in">
            <GreenWasteLogo size="hero" />
            <span className="text-[11px] tracking-[0.25em] uppercase text-emerald-400 font-semibold mt-2">
              CITIZEN CIVIC PLATFORM • RESOURCE RECOVERY INITIATIVE
            </span>
          </div>

          {/* Display Typography */}
          <h1 className="text-[40px] sm:text-[54px] font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Swachh<span className="text-[#34d399]">Setu</span>
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-[#75cf5e] to-[#16793f] rounded-full my-2.5"></div>

          <p className="text-[18px] sm:text-[22px] font-medium text-white/95 tracking-wide">
            Solid Waste &amp; Curbside Resource Recovery Platform
          </p>
          <p className="text-[14px] sm:text-[15px] text-white/70 mt-1 font-light italic">
            Where Civic Action, Source Segregation, and Environmental Integrity Converge
          </p>

          {/* Quick Action Navigation Pills (Replaces the Search Bar) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-[760px]">
            {trendingTags.map((tag, idx) => {
              const TagIcon = tag.icon;
              return tag.primary ? (
                <button
                  key={idx}
                  type="button"
                  onClick={tag.action}
                  className="px-5 py-2.5 rounded-full bg-[#16793f] hover:bg-[#239a4e] active:scale-95 text-white font-semibold text-[13px] sm:text-[14px] shadow-lg transition-all flex items-center gap-2 border border-emerald-400/40"
                >
                  <TagIcon className="w-4 h-4" />
                  <span>{tag.label}</span>
                </button>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={tag.action}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/15 text-white/90 transition-all text-[12px] sm:text-[13px] flex items-center gap-1.5"
                >
                  <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Civic Leadership Quote Banner (Overlapping the Hero Base) */}
        <div className="relative z-20 mt-10 sm:mt-14 w-full max-w-[840px] mx-auto px-4">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-gray-100">
            {/* Leadership Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#16793f] to-[#239a4e] p-0.5 shadow-md flex items-center justify-center text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#16793f] text-white flex items-center justify-center text-[9px] font-bold">
                SETU
              </div>
            </div>

            {/* Quote Block */}
            <div className="flex-1 text-center sm:text-left">
              <div className="text-[#16793f] text-[20px] font-serif leading-none">“</div>
              <p className="text-[14px] sm:text-[15px] text-gray-900 font-semibold leading-relaxed -mt-1">
                Waste management is a crucial component of sanitation.
              </p>
              <p className="text-[12px] sm:text-[13px] text-gray-600 mt-1 leading-normal">
                This acknowledges the importance of proper waste disposal in achieving the goals of the Swachh Bharat Abhiyan. Sanitation is not just about toilets, but also about managing waste effectively.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-[11px] sm:text-[12px] text-gray-500">
                <span className="font-semibold text-gray-900">Swachh Bharat Abhiyan</span>
                <span>•</span>
                <span>Clean City Resource Mission</span>
                <span>•</span>
                <span>27 September 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Civic Metrics Strip (Strictly Green & Black Shades) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-center">
          
          <div className="pt-2 sm:pt-0">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#16793f] mb-1.5">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              {totalDoorstepPickups.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">Doorstep Pickups</span>
          </div>

          <div className="pt-2 sm:pt-0 pl-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#16793f] mb-1.5">
              <Recycle className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              5,820
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">Tons Recycled</span>
          </div>

          <div className="pt-2 sm:pt-0 pl-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#16793f] mb-1.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              98.2%
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">Curbside Segregation</span>
          </div>

          <div className="pt-2 sm:pt-0 pl-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-800 mb-1.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              15
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">Municipal Wards</span>
          </div>

          <div className="pt-2 sm:pt-0 pl-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#16793f] mb-1.5">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              {verifiedHouseholds.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">Verified Households</span>
          </div>

          <div className="pt-2 sm:pt-0 pl-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#16793f] mb-1.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-[22px] sm:text-[24px] font-bold text-gray-900 leading-none">
              1,200+
            </div>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">SWaCH Beat Staff</span>
          </div>

        </div>
      </section>

      {/* 3. Online Services Hub (Strictly Green & Black Shades) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Dark Charcoal & Forest Green Online Services Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#1c211e] via-[#242b27] to-[#141816] text-white rounded-xl shadow-xl p-6 sm:p-7 flex flex-col justify-between border border-white/10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-white">
                    Online Civic Services
                  </h2>
                  <p className="text-[13px] text-white/70 mt-0.5">
                    Direct access to municipal solid waste clearance, recycling, and ward passes
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* 4 Feature Action Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <button
                  onClick={onOpenCreateModal}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                >
                  <Truck className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[16px] font-bold block leading-none text-white">1,100+</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium block mt-1">
                    Book Doorstep
                  </span>
                </button>

                <button
                  onClick={() => onNavigateTab('requests')}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                >
                  <Clock className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[16px] font-bold block leading-none text-white">Ward 12</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium block mt-1">
                    Track Beat
                  </span>
                </button>

                <button
                  onClick={() => onNavigateTab('guide')}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                >
                  <FileText className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[16px] font-bold block leading-none text-white">6 Streams</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium block mt-1">
                    Sorting Guide
                  </span>
                </button>

                <button
                  onClick={() => onNavigateTab('admin')}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                >
                  <Building2 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[16px] font-bold block leading-none text-white">15 Wards</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium block mt-1">
                    Ward Dispatch
                  </span>
                </button>
              </div>
            </div>

            {/* CTA Bottom Bar */}
            <div className="pt-6 mt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[13px] text-white/80">
                Avail doorstep waste clearance &amp; earn Swachhata credits
              </span>
              <button
                onClick={onOpenCreateModal}
                className="px-5 py-2 rounded-full bg-[#16793f] hover:bg-[#239a4e] text-white font-semibold text-[13px] transition-colors shadow flex items-center gap-1.5"
              >
                <span>Schedule Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Showcase Cards (Civic Initiatives) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            {/* Initiative 1: Swachhata Credits */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4.5 flex items-start gap-3.5 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Civic Incentive Scheme
                </span>
                <h4 className="text-[15px] font-bold text-gray-900 mt-0.5">
                  Swachhata Credit Points
                </h4>
                <p className="text-[12px] text-gray-500 mt-1 leading-snug">
                  Earn 50 incentive credits per verified segregated pickup. Redeemable against eco-civic incentives.
                </p>
                <button
                  onClick={() => onNavigateTab('requests')}
                  className="mt-2 text-[12px] font-semibold text-[#16793f] hover:underline flex items-center gap-1"
                >
                  <span>View Incentive Standing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Initiative 2: E-Waste Special Drive */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4.5 flex items-start gap-3.5 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#16793f] shrink-0">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#16793f] block">
                  Special Ward Drive
                </span>
                <h4 className="text-[15px] font-bold text-gray-900 mt-0.5">
                  Sunday E-Waste Collection
                </h4>
                <p className="text-[12px] text-gray-500 mt-1 leading-snug">
                  Safe handling and authorized recycling of old electronics, mobile batteries, cords, and obsolete home appliances.
                </p>
                <button
                  onClick={() => { onSelectCategory?.('E-Waste'); onNavigateTab('guide'); }}
                  className="mt-2 text-[12px] font-semibold text-[#16793f] hover:underline flex items-center gap-1"
                >
                  <span>Explore E-Waste Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Information Categories (Matching Image 2 Grid) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-6">
        
        {/* Section Header with Red Underline */}
        <div className="text-center mb-8">
          <h2 className="text-[26px] sm:text-[30px] font-bold text-gray-900 tracking-tight">
            Information Categories
          </h2>
          <div className="w-20 h-1 bg-[#16793f] rounded-full mx-auto mt-2"></div>
          <p className="text-[14px] text-gray-500 mt-2 max-w-[640px] mx-auto">
            Comprehensive citizen directories, segregation standards, and municipal protocols under Solid Waste Management Rules 2016
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. Organic */}
          <div 
            onClick={() => { onSelectCategory?.('Organic'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-emerald-700">
                  Organic &amp; Compostable Waste
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">Wet Waste Stream</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Kitchen food scraps, vegetable peels, garden clippings, and biodegradable plant matter processed for localized biogas and vermicomposting.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-emerald-600">
              <span>View Source Sorting Rules</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Plastic */}
          <div 
            onClick={() => { onSelectCategory?.('Plastic'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#16793f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Recycle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-[#16793f]">
                  Plastics &amp; Rigid Polymers
                </h3>
                <span className="text-[11px] text-[#16793f] font-semibold">Dry Recyclables</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Clean PET beverage bottles, milk jugs, detergent containers, and rigid packaging baled for authorized mechanical recycling centers.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-[#16793f]">
              <span>View Rinsing &amp; Baling Guidelines</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Paper */}
          <div 
            onClick={() => { onSelectCategory?.('Paper'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#16793f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-[#16793f]">
                  Paper, Cardboard &amp; Packaging
                </h3>
                <span className="text-[11px] text-[#16793f] font-semibold">Cellulose Dry Fibers</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Flattened corrugated cardboard, unsoiled newsprint, office files, and dry paper bags channeled to regional paper mills.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-[#16793f]">
              <span>View Bundling Specifications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. E-Waste */}
          <div 
            onClick={() => { onSelectCategory?.('E-Waste'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-black">
                  Electronic &amp; Battery Waste
                </h3>
                <span className="text-[11px] text-gray-600 font-semibold">Specialty E-Waste</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Computers, motherboards, chargers, lithium cells, and small appliances recovered through certified pollution board dismantlers.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-gray-800">
              <span>View Terminal Taping Protocol</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Medical */}
          <div 
            onClick={() => { onSelectCategory?.('Medical'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#16793f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-[#16793f]">
                  Domestic Sanitary &amp; Bio-Waste
                </h3>
                <span className="text-[11px] text-[#16793f] font-semibold">Clinical Protocol</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Expired pharmaceutical tablets, blister strips, and household clinical disposables wrapped securely in designated puncture-proof bags.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-[#16793f]">
              <span>View Clinical Safe Wrapping</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Other / SWaCH Network */}
          <div 
            onClick={() => { onSelectCategory?.('Other'); onNavigateTab('guide'); }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-gray-900">
                  Bulky Items &amp; SWaCH Network
                </h3>
                <span className="text-[11px] text-gray-600 font-semibold">Specialty Clearance</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Wrapped glass panes, dismantled household fixtures, dry scrap metal, and door-to-door coordination with SWaCH sanitation cooperatives.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[12px] font-semibold text-gray-700">
              <span>View Bulky Handling Norms</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Floating Right-Edge Quick Utility Dock */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-gray-200">
        <button
          onClick={onOpenCreateModal}
          title="Schedule Doorstep Collection"
          className="w-10 h-10 rounded-full hover:bg-emerald-50 text-[#16793f] flex items-center justify-center transition-colors"
        >
          <Truck className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigateTab('requests')}
          title="Ward Beat Timetable"
          className="w-10 h-10 rounded-full hover:bg-emerald-50 text-[#16793f] flex items-center justify-center transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigateTab('guide')}
          title="Waste Sorting Rules"
          className="w-10 h-10 rounded-full hover:bg-emerald-50 text-[#16793f] flex items-center justify-center transition-colors"
        >
          <FileText className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Portal link copied to clipboard!');
          }}
          title="Share Portal"
          className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => alert('Civic Helpdesk 24x7 Toll-Free: 1800-103-0222')}
          title="Helpdesk Support"
          className="w-10 h-10 rounded-full hover:bg-emerald-50 text-[#16793f] flex items-center justify-center transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
