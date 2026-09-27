import { useState } from 'react';
import { RequestItem, User } from '../../types';
import StatusStepper from '../common/StatusStepper';
import VerifiedBadge from '../common/VerifiedBadge';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Star,
  ChevronDown,
  Clock
} from 'lucide-react';
import UserGamificationCard from './UserGamificationCard';

interface RequestHistoryProps {
  user: User;
  requests: RequestItem[];
  onOpenCreateModal: () => void;
  onRateCollector?: (req: RequestItem) => void;
}

export default function RequestHistory({
  user,
  requests,
  onOpenCreateModal,
  onRateCollector
}: RequestHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'rejected'>('all');
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  const activeCount = requests.filter(r => !['Completed', 'Rejected'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;
  const isRateLimited = activeCount >= 5;

  const filteredRequests = requests.filter(r => {
    if (filter === 'active') return !['Completed', 'Rejected'].includes(r.status);
    if (filter === 'completed') return r.status === 'Completed';
    if (filter === 'rejected') return r.status === 'Rejected';
    return true;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Organic': return 'bg-[#16793f]/10 text-[#16793f] border-[#16793f]/20';
      case 'Plastic': return 'bg-[#239a4e]/10 text-[#239a4e] border-[#239a4e]/20';
      case 'Paper': return 'bg-[#75cf5e]/20 text-[#16793f] border-[#75cf5e]/40';
      case 'E-Waste': return 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20';
      case 'Medical': return 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/20';
      default: return 'bg-black/5 text-[#1c211e] border-border-hairline';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-3 py-1 rounded-pill text-[12px] font-semibold bg-gray-100 border border-gray-200 text-gray-800">Request Logged</span>;
      case 'Assigned':
        return <span className="px-3 py-1 rounded-pill text-[12px] font-semibold bg-emerald-50 border border-[#16793f]/20 text-[#16793f]">Van Assigned</span>;
      case 'On the Way':
        return <span className="px-3 py-1 rounded-pill text-[12px] font-semibold bg-emerald-100 border border-[#239a4e]/30 text-[#16793f]">Driver En Route</span>;
      case 'Completed':
        return <span className="px-3 py-1 rounded-pill text-[12px] font-semibold bg-emerald-50 border border-emerald-300 text-[#16793f]">Collected &amp; Verified</span>;
      case 'Rejected':
        return <span className="px-3 py-1 rounded-pill text-[12px] font-semibold bg-red-50 border border-red-200 text-[#dc2626]">Unable to Collect</span>;
      default:
        return null;
    }
  };

  const getTimeSlot = (id: string) => {
    // Generate realistic municipal morning pickup beats
    const slots = ['07:00 AM – 09:30 AM (Morning Beat)', '10:00 AM – 12:30 PM (Midday Beat)', '02:30 PM – 05:00 PM (Afternoon Beat)'];
    const idx = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % slots.length;
    return slots[idx];
  };

  return (
    <div className="space-y-6">
      {/* 1. Citizen Property & Civic Account Summary Card */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-ink leading-tight">
              {user.name}
            </h1>
            {user.verified && <VerifiedBadge size="md" />}
            {user.rejected_request_count > 2 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-semibold bg-[#fff2f2] text-[#d70015] border border-[#ffb3b8]">
                <AlertTriangle className="w-3.5 h-3.5" /> Frequent Discrepancy Review
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-muted48 mt-1">
            <span>Consumer ID: <strong className="text-ink font-medium">SETU-411038-7241</strong></span>
            <span>•</span>
            <span>{user.contact_info}</span>
          </div>
        </div>

        {/* Civic Standing Summary Pills */}
        <div className="flex items-center gap-3 sm:gap-4 bg-canvas-parchment p-3 rounded-lg border border-border-soft">
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-primary leading-tight">
              {user.points}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">
              Swachhata Pts
            </div>
          </div>
          <div className="h-7 w-[1px] bg-border-hairline"></div>
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-[#16793f] leading-tight">
              {user.streak_count}w
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">
              Active Streak
            </div>
          </div>
          <div className="h-7 w-[1px] bg-border-hairline"></div>
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-[#16793f] leading-tight">
              {completedCount}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">
              Clean Pickups
            </div>
          </div>
        </div>
      </div>

      {/* 2. Collapsible Swachhata Incentive Credit Card */}
      <UserGamificationCard user={user} />

      {/* 3. Filter Navigation & Rate Limit Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-1 bg-canvas p-1 rounded-pill border border-border-hairline w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
              filter === 'all'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-muted80 hover:text-ink'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
              filter === 'active'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-muted80 hover:text-ink'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
              filter === 'completed'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-muted80 hover:text-ink'
            }`}
          >
            Completed ({completedCount})
          </button>
          {rejectedCount > 0 && (
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
                filter === 'rejected'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted80 hover:text-ink'
              }`}
            >
              Exceptions ({rejectedCount})
            </button>
          )}
        </div>

        {isRateLimited && (
          <div className="text-[12px] text-[#d70015] bg-[#fff2f2] border border-[#ffb3b8] px-3 py-1 rounded-pill font-medium">
            Active in-flight limit reached (5/5). Await driver completion before logging new beat requests.
          </div>
        )}
      </div>

      {/* 4. Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-canvas border border-border-hairline rounded-lg p-12 text-center">
            <p className="text-[16px] font-medium text-ink">No waste collection requests found in this view.</p>
            <p className="text-[13px] text-ink-muted48 mt-1">Schedule doorstep collection for your segregated recyclables using the button below.</p>
            <button
              onClick={onOpenCreateModal}
              disabled={isRateLimited}
              className="btn-primary text-[13px] mt-4 disabled:opacity-50"
            >
              Schedule First Pickup
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isTimelineOpen = expandedTimelineId === req.id;
            return (
              <div
                key={req.id}
                className="bg-canvas border border-border-hairline rounded-lg p-5 sm:p-6 space-y-4 transition-all hover:border-border-hairline/80 shadow-xs"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border-soft">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-[12px] font-semibold border ${getCategoryColor(req.waste_category)}`}>
                      {req.waste_category} Recyclables
                    </span>
                    <span className="text-[12px] font-mono text-ink-muted48">
                      {req.id.replace('req_', 'REQ-').replace(/_/g, '-').toUpperCase().slice(0, 18)}
                    </span>
                    <span className="text-ink-muted48 text-[12px]">•</span>
                    <span className="text-[12px] text-ink-muted80 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {req.pickup_date}
                    </span>
                    <span className="text-ink-muted48 text-[12px]">•</span>
                    <span className="text-[12px] text-ink-muted80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink-muted48" /> {getTimeSlot(req.id)}
                    </span>
                  </div>

                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Photo thumbnail */}
                  <div className="md:col-span-3">
                    <div className="aspect-video rounded-md overflow-hidden bg-black/5 border border-border-soft relative">
                      <img
                        src={req.photo_url}
                        alt="Segregated waste proof"
                        className="w-full h-full object-cover shadow-product"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted48 mt-1.5">
                      {req.photo_exif_present ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#16793f]" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-gray-700" />
                      )}
                      <span>{req.photo_exif_present ? 'Curbside GPS Geo-Tagged' : 'Manual Camera Upload'}</span>
                    </div>
                  </div>

                  {/* Operational Information */}
                  <div className="md:col-span-9 space-y-2.5">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted48 block font-semibold">
                        Doorstep Collection Address
                      </span>
                      <p className="text-[14px] text-ink font-medium flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{req.pickup_location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[12px]">
                      <div>
                        <span className="text-ink-muted48 block">Assigned Sanitation Beat Staff:</span>
                        <strong className="text-ink font-medium">
                          {req.collector_name ? `${req.collector_name} (Sanitation Beat Staff)` : 'Awaiting Beat Van Dispatch'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-muted48 block">Collection Vehicle / Depot:</span>
                        <strong className="text-ink font-medium">
                          {req.collector_name ? 'Electric Collection Tipper MH-12-Q-4482' : 'Civic Ward Depot'}
                        </strong>
                      </div>
                    </div>

                    {/* Ratings & Notes if completed */}
                    {req.status === 'Completed' && (
                      <div className="pt-2 border-t border-border-soft">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                          <div className="flex items-center gap-1.5 text-ink font-medium">
                            <Star className="w-3.5 h-3.5 text-[#16793f] fill-[#16793f]" />
                            <span>
                              {req.user_rating 
                                ? `Your Rating: ${req.user_rating} / 5 Stars`
                                : 'Rate Driver Punctuality & Handling:'}
                            </span>
                            {!req.user_rating && onRateCollector && (
                              <button
                                onClick={() => onRateCollector(req)}
                                className="ml-2 text-primary font-semibold underline hover:text-primary-focus"
                              >
                                Submit Rating
                              </button>
                            )}
                          </div>

                          {req.collector_rating && (
                            <span className="text-ink-muted80 bg-surface-pearl px-2.5 py-1 rounded text-[11px] italic">
                              Staff Feedback: "{req.collector_comment || 'Cleanly segregated recyclables.'}" ({req.collector_rating} / 5)
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rejection notice if rejected */}
                    {req.status === 'Rejected' && (
                      <div className="p-3 bg-[#fff2f2] border border-[#ffb3b8] rounded text-[12px] text-[#d70015]">
                        <strong>Staff Collection Report: </strong>
                        <span>{req.rejection_reason || 'Premises locked or no segregated waste found outside society gate.'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Timeline Toggle */}
                <div className="pt-2 border-t border-border-soft flex items-center justify-between">
                  <button
                    onClick={() => setExpandedTimelineId(isTimelineOpen ? null : req.id)}
                    className="text-[12px] text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    <span>{isTimelineOpen ? 'Hide Dispatch Progress' : 'Track Collection Progress'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTimelineOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <span className="text-[11px] text-ink-muted48">
                    Logged: {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Expandable Stepper */}
                {isTimelineOpen && (
                  <div className="pt-2 pb-1 border-t border-border-soft bg-canvas-parchment/30 -mx-5 sm:-mx-6 px-5 sm:px-6 -mb-5 sm:-mb-6 rounded-b-lg">
                    <StatusStepper
                      status={req.status}
                      rejectionReason={req.rejection_reason}
                      collectorName={req.collector_name}
                      updatedAt={req.updated_at}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
