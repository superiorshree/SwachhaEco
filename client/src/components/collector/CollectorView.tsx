import { useState } from 'react';
import { RequestItem, User } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Check, 
  XCircle, 
  User as UserIcon, 
  ShieldCheck, 
  ShieldAlert,
  MapPin
} from 'lucide-react';

interface CollectorViewProps {
  collector: User;
  allRequests: RequestItem[];
  onRefresh: () => void;
  onOpenRating: (req: RequestItem) => void;
  onNotify?: (title: string, message: string) => void;
}

export default function CollectorView({
  collector,
  allRequests,
  onRefresh,
  onOpenRating,
  onNotify
}: CollectorViewProps) {
  const [activeTab, setActiveTab] = useState<'assigned' | 'pool'>('assigned');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Premises locked / No waste outside society gate');
  const [customReason, setCustomReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // My assigned tasks
  const myAssigned = allRequests.filter(
    r => r.collector_id === collector.id && !['Completed', 'Rejected'].includes(r.status)
  );

  // Completed today by this collector
  const myCompleted = allRequests.filter(
    r => r.collector_id === collector.id && r.status === 'Completed'
  );

  // Unassigned pool (Submitted and no collector)
  const unassignedPool = allRequests.filter(
    r => r.status === 'Submitted' && !r.collector_id
  );

  const handleClaim = async (requestId: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/requests/${requestId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collector_id: collector.id })
      });
      if (res.ok) {
        onRefresh();
        setActiveTab('assigned');
        onNotify?.('Pickup Assigned to Beat', `Request assigned to ${collector.name}. Updated route itinerary.`);
      }
    } catch (err) {
      console.error('Error claiming request:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          collector_id: collector.id
        })
      });
      if (res.ok) {
        onRefresh();
        if (newStatus === 'On the Way') {
          onNotify?.('Driver En Route', 'Citizen notified via SMS/Portal that collection tipper is en route.');
        } else if (newStatus === 'Completed') {
          onNotify?.('Collection Completed', 'Waste verified curbside. Promoted to citizen segregation review.');
          const req = allRequests.find(r => r.id === requestId);
          if (req) onOpenRating(req);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectConfirm = async (requestId: string) => {
    try {
      setIsUpdating(true);
      const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          rejection_reason: finalReason || 'Premises locked',
          collector_id: collector.id
        })
      });
      if (res.ok) {
        setRejectingId(null);
        onRefresh();
        onNotify?.('Collection Exception Logged', `Exception logged: "${finalReason}". Municipal record updated.`);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sanitation Staff Route Header */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
            Community Sanitation Initiative • Field Beat
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-ink mt-0.5">
            {collector.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-muted48 mt-1">
            <span>Staff ID: <strong className="text-ink font-medium">SETU-SAN-0402</strong></span>
            <span>•</span>
            <span>Assigned Vehicle: <strong className="text-ink font-medium">Electric Collection Tipper (MH-12-Q-4482)</strong></span>
            <span>•</span>
            <span>Beat Zone: <strong className="text-ink font-medium">Ward 12 (Kothrud / Mayur Colony)</strong></span>
          </div>
        </div>

        {/* Operational Beat KPI metrics */}
        <div className="flex items-center gap-3 sm:gap-4 bg-canvas-parchment p-3 rounded-lg border border-border-soft">
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-primary">{myAssigned.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">Active Beat</div>
          </div>
          <div className="h-7 w-[1px] bg-border-hairline"></div>
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-gray-800">{unassignedPool.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">Ward Pool</div>
          </div>
          <div className="h-7 w-[1px] bg-border-hairline"></div>
          <div className="text-center px-2">
            <div className="text-[20px] font-semibold text-[#16793f]">{myCompleted.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted48 font-semibold mt-0.5">Completed Today</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-canvas p-1 rounded-pill border border-border-hairline w-fit">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
            activeTab === 'assigned'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-muted80 hover:text-ink'
          }`}
        >
          My Scheduled Beat ({myAssigned.length})
        </button>
        <button
          onClick={() => setActiveTab('pool')}
          className={`px-3.5 py-1 text-[13px] rounded-pill font-medium transition-all ${
            activeTab === 'pool'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-muted80 hover:text-ink'
          }`}
        >
          Ward Unclaimed Pool ({unassignedPool.length})
        </button>
      </div>

      {/* Tab 1: Assigned Route */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {myAssigned.length === 0 ? (
            <div className="bg-canvas border border-border-hairline rounded-lg p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#16793f] mx-auto mb-2.5 opacity-80" />
              <p className="text-[16px] font-medium text-ink">All assigned route pickups have been fulfilled.</p>
              <p className="text-[13px] text-ink-muted48 mt-1">Review the Ward Unclaimed Pool to claim pending doorstep requests on your beat.</p>
              <button
                onClick={() => setActiveTab('pool')}
                className="btn-primary text-[13px] mt-4"
              >
                Inspect Ward Pool
              </button>
            </div>
          ) : (
            myAssigned.map((req) => (
              <div
                key={req.id}
                className="bg-canvas border border-border-hairline rounded-lg p-5 sm:p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-border-soft">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[12px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {req.waste_category} Recyclables
                    </span>
                    <span className="text-[12px] font-mono text-ink-muted48">
                      {req.id.replace('req_', 'REQ-').slice(0, 16)}
                    </span>
                    <span className="text-ink-muted48 text-[12px]">•</span>
                    <span className="text-[12px] text-ink-muted80 flex items-center gap-1 font-medium">
                      <UserIcon className="w-3.5 h-3.5 text-primary" /> Citizen: {req.user_name}
                    </span>
                    <span className="text-ink-muted48 text-[12px]">•</span>
                    <span className="text-[12px] text-ink-muted80 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted48" /> {req.pickup_date}
                    </span>
                  </div>

                  <span className="text-[12px] px-3 py-0.5 rounded-pill bg-[#e8f2fc] text-primary font-semibold border border-primary/20">
                    Status: {req.status === 'On the Way' ? 'Driver En Route' : req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-3">
                    <div className="aspect-video rounded-md overflow-hidden bg-black/5 border border-border-soft">
                      <img
                        src={req.photo_url}
                        alt="Doorstep waste photo"
                        className="w-full h-full object-cover shadow-product"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted48 mt-1.5">
                      {req.photo_exif_present ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#16793f]" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-gray-700" />
                      )}
                      <span>{req.photo_exif_present ? 'Curbside GPS Tag Verified' : 'Manual Camera Upload'}</span>
                    </div>
                  </div>

                  <div className="md:col-span-9 space-y-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted48 block font-semibold">
                        Pickup Location
                      </span>
                      <p className="text-[14px] text-ink font-medium flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{req.pickup_location}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-border-soft">
                      {req.status === 'Assigned' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(req.id, 'On the Way')}
                          className="btn-primary text-[13px] flex items-center gap-1.5 py-1.5 px-4"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Route Navigation</span>
                        </button>
                      )}

                      {req.status === 'On the Way' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(req.id, 'Completed')}
                          className="btn-primary text-[13px] bg-[#16793f] hover:bg-[#239a4e] border-transparent flex items-center gap-1.5 py-1.5 px-4"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify Curbside &amp; Rate Segregation</span>
                        </button>
                      )}

                      <button
                        disabled={isUpdating}
                        onClick={() => setRejectingId(req.id)}
                        className="px-3.5 py-1.5 rounded-pill text-[13px] font-medium text-[#d70015] border border-[#ffb3b8] hover:bg-[#fff2f2] transition-colors flex items-center gap-1.5 active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Report Exception</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exception Reporting Dialog */}
                {rejectingId === req.id && (
                  <div className="mt-3 p-4 rounded-md bg-[#fff2f2] border border-[#ffb3b8] space-y-3">
                    <span className="text-[13px] font-semibold text-[#d70015] block">
                      Record Collection Exception (Mandatory Staff Report)
                    </span>
                    <div className="space-y-2 text-[12px]">
                      {[
                        'Premises locked / No waste outside society gate',
                        'Contaminated / Unsegregated mixed waste',
                        'Duplicate request already collected on morning sweep',
                        'Society security denied entry to collection vehicle',
                        'Other'
                      ].map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer text-ink">
                          <input
                            type="radio"
                            name="rejectReason"
                            value={r}
                            checked={rejectionReason === r}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="text-primary"
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                      {rejectionReason === 'Other' && (
                        <input
                          type="text"
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Detail specific curbside issue for municipal supervisor..."
                          className="w-full bg-white text-ink text-[12px] border border-border-hairline rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="btn-pearl-capsule text-[12px] py-1 px-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectConfirm(req.id)}
                        className="px-4 py-1.5 rounded-pill bg-[#d70015] text-white text-[12px] font-semibold hover:bg-[#c00012]"
                      >
                        Confirm Exception Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Unassigned Ward Pool */}
      {activeTab === 'pool' && (
        <div className="space-y-4">
          {unassignedPool.length === 0 ? (
            <div className="bg-canvas border border-border-hairline rounded-lg p-12 text-center">
              <p className="text-[16px] font-medium text-ink">No unclaimed requests in Ward 12 pool.</p>
              <p className="text-[13px] text-ink-muted48 mt-1">All registered doorstep bookings are currently assigned to beat units.</p>
            </div>
          ) : (
            unassignedPool.map((req) => (
              <div
                key={req.id}
                className="bg-canvas border border-border-hairline rounded-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-18 h-18 rounded-md overflow-hidden bg-black/5 shrink-0 border border-border-soft">
                    <img
                      src={req.photo_url}
                      alt="Waste preview"
                      className="w-full h-full object-cover shadow-product"
                    />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {req.waste_category} Recyclables
                    </span>
                    <h3 className="text-[16px] font-semibold text-ink mt-1">
                      {req.pickup_location}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-muted48 mt-1">
                      <span>Citizen: <strong className="text-ink font-medium">{req.user_name}</strong></span>
                      <span>•</span>
                      <span>Beat Date: <strong className="text-ink font-medium">{req.pickup_date}</strong></span>
                      <span>•</span>
                      <span>Preferred Slot: <strong>07:00 AM – 09:30 AM</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isUpdating}
                  onClick={() => handleClaim(req.id)}
                  className="btn-primary text-[13px] w-full md:w-auto px-5 py-2 whitespace-nowrap"
                >
                  Accept to My Route
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
