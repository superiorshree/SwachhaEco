import { Plus, Calendar, MapPin } from 'lucide-react';
import { User } from '../../types';

interface SubNavProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  openRequestCount: number;
}

export default function SubNav({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  openRequestCount
}: SubNavProps) {
  return (
    <nav className="h-[54px] bg-canvas/90 backdrop-blur-md border-b border-border-hairline flex items-center justify-between px-4 sm:px-6 sticky top-[88px] z-40">
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-[17px] sm:text-[19px] font-semibold tracking-tight text-ink leading-tight">
            {currentUser?.role === 'collector'
              ? 'Sanitation Beat & Daily Route'
              : currentUser?.role === 'admin'
              ? 'Operations Oversight Console'
              : 'Doorstep Collection Service'}
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted48">
            <MapPin className="w-3 h-3 text-primary" />
            <span>
              {currentUser?.role === 'collector'
                ? 'Field Sanitation Unit • Kothrud & Baner Wards'
                : currentUser?.role === 'admin'
                ? 'City Control Room • Central Operations'
                : 'Ward 12 (Kothrud Depot Beat) • Clean City Initiative'}
            </span>
          </div>
        </div>

        {/* Tab links for citizen user */}
        {currentUser?.role === 'user' && (
          <div className="hidden md:flex items-center space-x-2 text-[13px] ml-4 pl-4 border-l border-border-soft">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1 rounded-pill transition-colors ${
                activeTab === 'requests'
                  ? 'bg-canvas-parchment font-semibold text-primary'
                  : 'text-ink-muted80 hover:text-ink'
              }`}
            >
              Collection History
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1 rounded-pill transition-colors ${
                activeTab === 'guide'
                  ? 'bg-canvas-parchment font-semibold text-primary'
                  : 'text-ink-muted80 hover:text-ink'
              }`}
            >
              Segregation Rules
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {currentUser?.role === 'user' && (
          <>
            <div className="hidden lg:flex items-center gap-1.5 text-[12px] text-ink-muted80 pr-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Next Morning Sweep: </span>
              <strong className="text-ink">07:00 AM – 09:30 AM</strong>
            </div>

            <button
              onClick={onOpenCreateModal}
              disabled={openRequestCount >= 5}
              className="btn-primary text-[13px] py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50"
              title={openRequestCount >= 5 ? 'Maximum 5 active requests reached' : 'Schedule doorstep pickup'}
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Collection</span>
            </button>
          </>
        )}

        {currentUser?.role === 'collector' && (
          <button
            onClick={() => setActiveTab('collector')}
            className="btn-primary text-[13px] py-1.5 px-4"
          >
            Sync Route Beat
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className="btn-primary text-[13px] py-1.5 px-4"
          >
            Refresh City Telemetry
          </button>
        )}
      </div>
    </nav>
  );
}
