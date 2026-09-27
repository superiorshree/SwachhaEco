import { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { 
  Phone, 
  ChevronDown, 
  Check, 
  ShieldCheck,
  Home
} from 'lucide-react';
import GreenWasteLogo from '../common/GreenWasteLogo';

interface GlobalNavProps {
  users: User[];
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function GlobalNav({
  users,
  currentUser,
  onSelectUser,
  activeTab,
  setActiveTab
}: GlobalNavProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getUserSubtext = (u: User) => {
    if (u.role === 'admin') return 'Central Operations Headquarters';
    if (u.role === 'collector') {
      return u.id === 'collector_santosh' ? 'Ward 12 Beat (Kothrud Depot)' : 'Ward 14 Beat (Aundh / Baner)';
    }
    if (u.id === 'user_shreeyansh') return 'Ward 12 • Paud Road';
    if (u.id === 'user_priya') return 'Ward 08 • Viman Nagar';
    return 'Ward 19 • Hadapsar';
  };

  return (
    <header className="bg-surface-black text-white sticky top-0 z-50 shadow-md">
      {/* Top Civic Identity & National Utility Bar */}
      <div className="h-[48px] px-4 sm:px-6 border-b border-white/10 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 text-left group"
        >
          {/* Custom Green Waste Logo */}
          <GreenWasteLogo size="sm" />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-[16px] text-white group-hover:text-emerald-400 transition-colors">
                Swachha<span className="text-emerald-400">Eco</span>
              </span>
              <span className="text-[11px] font-normal px-2 py-0.2 rounded bg-white/10 text-white/80 hidden sm:inline">
                Civic Initiative
              </span>
            </div>
            <span className="text-[10px] text-white/50 tracking-wide block -mt-0.5">
              Solid Waste &amp; Curbside Resource Recovery Platform
            </span>
          </div>
        </button>

        {/* Right Utility Bar: Helpline & Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Civic Helpline */}
          <div className="flex items-center gap-2 text-[11px] text-white/70">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Civic Helpline: </span>
            <span className="font-semibold text-white/90">1800-103-0222</span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="hidden md:inline">Toll-Free (24x7)</span>
          </div>

          {/* User Session & Role Profile Switcher */}
          {currentUser && (
            <div className="relative pl-2 sm:pl-3 border-l border-white/10" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-pill bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-[#dc2626] text-white'
                    : currentUser.role === 'collector'
                    ? 'bg-[#16793f] text-white'
                    : 'bg-primary text-white'
                }`}>
                  {getInitials(currentUser.name)}
                </div>

                <div className="hidden md:block text-left pr-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[12px] font-semibold text-white">
                      {currentUser.name}
                    </span>
                    {currentUser.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/50 block mt-0.5">
                    {currentUser.role === 'admin'
                      ? 'Municipal Officer'
                      : currentUser.role === 'collector'
                      ? 'Sanitation Staff'
                      : 'Verified Citizen'}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile & Persona Switcher Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-[#1d1d1f] border border-white/15 shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="p-3.5 bg-white/5 border-b border-white/10">
                    <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                      Current Session
                    </div>
                    <div className="font-semibold text-white text-[14px] mt-1 flex items-center gap-1.5">
                      {currentUser.name}
                      {currentUser.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-white/60 mt-0.5">
                      {currentUser.contact_info}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                      {getUserSubtext(currentUser)}
                    </div>
                  </div>

                  <div className="p-2 border-b border-white/10">
                    <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                      Switch Role Profile
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {users.map(u => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors ${
                              isCurrent
                                ? 'bg-white/15 text-white'
                                : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-[#dc2626] text-white'
                                  : u.role === 'collector'
                                  ? 'bg-[#16793f] text-white'
                                  : 'bg-primary text-white'
                              }`}>
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <div className="text-[12px] font-medium leading-none flex items-center gap-1">
                                  <span>{u.name}</span>
                                  {u.verified && <span className="text-[10px] text-emerald-400 font-semibold">Verified</span>}
                                  {u.rejected_request_count > 2 && <span className="text-[10px] text-[#ff453a] font-semibold">Flagged</span>}
                                </div>
                                <span className="text-[10px] text-white/40 block mt-0.5 capitalize">
                                  {u.role === 'admin' ? 'Municipal Officer' : u.role === 'collector' ? 'Sanitation Staff' : 'Resident Citizen'}
                                </span>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2 text-[11px] text-white/40 flex items-center justify-between px-3">
                    <span>SWM By-laws 2016</span>
                    <span>SwachhaEco v3.0</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-4 sm:px-6 flex items-center justify-between h-[42px] text-[13px] bg-black/40 border-b border-white/5">
        <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none py-1">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill transition-colors ${
              activeTab === 'home'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-pill transition-colors ${
              activeTab === 'requests'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {currentUser?.role === 'user' ? 'Doorstep Collections' : 'All Collections'}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-pill transition-colors ${
              activeTab === 'guide'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Waste Sorting Guide
          </button>

          {currentUser?.role === 'collector' && (
            <button
              onClick={() => setActiveTab('collector')}
              className={`px-3 py-1.5 rounded-pill transition-colors ${
                activeTab === 'collector'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Field Route &amp; Pickup Beat
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-pill transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Operations Oversight Dashboard
            </button>
          )}
        </nav>

        {currentUser?.role === 'user' && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-white/60">
            <span>Property Consumer ID: </span>
            <code className="text-white/90 font-mono bg-white/10 px-1.5 py-0.5 rounded">
              SETU-411038-7241
            </code>
          </div>
        )}
      </div>
    </header>
  );
}
