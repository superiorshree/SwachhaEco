import { useState } from 'react';
import { RequestItem, User } from '../../types';
import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw,
  FileCheck2,
  Calendar,
  User as UserIcon,
  Building2,
  MapPin,
  Truck
} from 'lucide-react';
import VerifiedBadge from '../common/VerifiedBadge';

interface AdminDashboardProps {
  requests: RequestItem[];
  users: User[];
  collectors: User[];
  onRefresh: () => void;
  onNotify?: (title: string, message: string) => void;
}

export default function AdminDashboard({
  requests,
  users,
  collectors,
  onRefresh,
  onNotify
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reassigningReq, setReassigningReq] = useState<RequestItem | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');

  // Stats computation
  const total = requests.length;
  const completed = requests.filter(r => r.status === 'Completed').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;
  const overallRejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0';

  // Category counts
  const categoryCounts = ['Organic', 'Plastic', 'Paper', 'E-Waste', 'Medical', 'Other'].map(cat => ({
    category: cat,
    count: requests.filter(r => r.waste_category === cat).length
  }));

  // Status counts
  const statusCounts = ['Submitted', 'Assigned', 'On the Way', 'Completed', 'Rejected'].map(st => ({
    status: st,
    count: requests.filter(r => r.status === st).length
  }));

  // Flagged users with > 2 rejections
  const flaggedUsers = users.filter(u => u.rejected_request_count > 2);

  // Filtered requests list
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.waste_category === categoryFilter;
    const matchesStartDate = !startDate || r.pickup_date >= startDate;
    const matchesEndDate = !endDate || r.pickup_date <= endDate;
    return matchesSearch && matchesStatus && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const handleReassign = async () => {
    if (!reassigningReq) return;
    try {
      const res = await fetch(`/api/requests/${reassigningReq.id}/reassign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collector_id: selectedCollectorId || null })
      });
      if (res.ok) {
        setReassigningReq(null);
        onRefresh();
        const targetCol = collectors.find(c => c.id === selectedCollectorId);
        onNotify?.(
          'Beat Schedule Updated',
          targetCol
            ? `Doorstep pickup reassigned to ${targetCol.name} (SWaCH Beat Van).`
            : 'Pickup route returned to unassigned ward pool.'
        );
      }
    } catch (err) {
      console.error('Error reassigning collector:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Official Municipal Header Banner */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-primary uppercase tracking-wider">
              Civic Operations Directorate • Solid Waste Management (SWM)
            </span>
          </div>
          <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight text-ink">
            Central Operations &amp; Ward Oversight Console
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px] text-ink-muted80">
            <span className="font-medium text-ink">Officer: Mahesh Gokhale</span>
            <span className="text-ink-muted48">•</span>
            <span>Chief Operations Coordinator (SWM)</span>
            <span className="text-ink-muted48">•</span>
            <span className="flex items-center gap-1 text-ink-muted48">
              <MapPin className="w-3.5 h-3.5" /> Central Operations Desk, Ward 12
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn-pearl-capsule flex items-center gap-2 text-[13px] self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Ward Logs</span>
        </button>
      </div>

      {/* 2. Official SWM Protocol Callout */}
      <div className="bg-surface-pearl border border-border-soft rounded-lg p-6">
        <div className="flex items-center gap-2 text-primary font-semibold text-[15px] mb-2">
          <FileCheck2 className="w-5 h-5 shrink-0" />
          <span>Curbside Verification &amp; Contamination Audit Protocol</span>
        </div>
        <p className="text-[14px] text-ink-muted80 leading-relaxed">
          Standard Operating Procedure under the <strong>Solid Waste Management Rules 2016</strong> and Clean City Directives. All doorstep waste pickups require physical inspection by sanitation supervisors before clearance sign-off to ensure 100% source segregation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 bg-canvas rounded-md border border-border-hairline">
            <span className="text-[13px] font-semibold text-ink block">1. Geo-Tagged Citizen Submission</span>
            <p className="text-[12px] text-ink-muted48 mt-1 leading-relaxed">
              Household photo upload with camera EXIF validation, GPS location matching, and a 5-request daily household rate limit.
            </p>
          </div>
          <div className="p-4 bg-canvas rounded-md border border-border-hairline">
            <span className="text-[13px] font-semibold text-ink block">2. Doorstep Curbside Inspection</span>
            <p className="text-[12px] text-ink-muted48 mt-1 leading-relaxed">
              Assigned SWaCH staff verifies wet, dry, and sanitary segregation before tipping; unsegregated loads receive an explicit rejection log.
            </p>
          </div>
          <div className="p-4 bg-canvas rounded-md border border-border-hairline">
            <span className="text-[13px] font-semibold text-ink block">3. Incentive Standing &amp; Redressal</span>
            <p className="text-[12px] text-ink-muted48 mt-1 leading-relaxed">
              5+ verified clean collections earn Swachh Citizen incentive credits; &gt;2 rejections flag property for ward inspector outreach.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas border border-border-hairline rounded-lg p-5">
          <span className="text-[12px] uppercase text-ink-muted48 font-medium">Total Scheduled Pickups</span>
          <div className="text-[32px] font-semibold text-ink mt-1">{total}</div>
          <span className="text-[11px] text-ink-muted48 mt-1 block">Across Ward 12 &amp; Ward 14</span>
        </div>

        <div className="bg-canvas border border-border-hairline rounded-lg p-5">
          <span className="text-[12px] uppercase text-ink-muted48 font-medium">Completed Collections</span>
          <div className="text-[32px] font-semibold text-[#248a3d] mt-1">{completed}</div>
          <span className="text-[11px] text-ink-muted48 mt-1 block">Doorstep verified &amp; tipped</span>
        </div>

        <div className="bg-canvas border border-border-hairline rounded-lg p-5">
          <span className="text-[12px] uppercase text-ink-muted48 font-medium">Contamination / Rejection Rate</span>
          <div className="text-[32px] font-semibold text-[#d70015] mt-1">{overallRejectionRate}%</div>
          <span className="text-[11px] text-ink-muted48 mt-1 block">{rejected} unsegregated loads logged</span>
        </div>

        <div className="bg-canvas border border-border-hairline rounded-lg p-5">
          <span className="text-[12px] uppercase text-ink-muted48 font-medium">Certified Beat Collectors</span>
          <div className="text-[32px] font-semibold text-primary mt-1">{collectors.length}</div>
          <span className="text-[11px] text-ink-muted48 mt-1 block">SWaCH cooperative field staff</span>
        </div>
      </div>

      {/* 4. Flagged Households (>2 rejections) */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#d70015]" />
            <h3 className="text-[17px] font-semibold text-ink">
              Households Flagged for Contamination / Field Review (Rejections &gt; 2)
            </h3>
          </div>
          <span className="text-[12px] px-3 py-0.5 rounded-pill bg-[#fff2f2] text-[#d70015] font-semibold border border-[#ffb3b8]">
            {flaggedUsers.length} Flagged Households
          </span>
        </div>

        <p className="text-[13px] text-ink-muted48 mt-2.5">
          Under SWM Bylaws, households with repeated non-segregated waste dispatches receive door-to-door educational outreach by ward animators before penalty escalation.
        </p>

        {flaggedUsers.length === 0 ? (
          <p className="text-[13px] text-ink-muted80 mt-4 italic">No citizen accounts currently exceed the 2-rejection threshold in this ward.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedUsers.map(u => (
              <div key={u.id} className="p-4 rounded-md bg-[#fff2f2]/60 border border-[#ffb3b8] flex items-center justify-between">
                <div>
                  <h4 className="text-[15px] font-semibold text-ink">{u.name}</h4>
                  <p className="text-[12px] text-ink-muted48 mt-0.5">{u.contact_info}</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[#d70015] block">
                    {u.rejected_request_count} Non-Compliance Logs
                  </span>
                  <span className="text-[11px] text-[#d70015] font-medium">
                    Ward Outreach Required
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Per-User Collection & Rejection Rate Audit Table */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6">
        <h3 className="text-[17px] font-semibold text-ink mb-1">
          Ward Household Segregation &amp; Dispatch Register
        </h3>
        <p className="text-[13px] text-ink-muted48 mb-4">
          Household-level record of dispatches, successful collections, contamination rejections, and verified badge standing
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-soft text-ink-muted48 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Citizen / Property</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">Pending</th>
                <th className="py-2.5 px-3 text-center">Collected</th>
                <th className="py-2.5 px-3 text-center">Contaminated</th>
                <th className="py-2.5 px-3 text-center">Non-Compliance %</th>
                <th className="py-2.5 px-3 text-right">Incentive Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {users.filter(u => u.role === 'user').map(u => {
                const totalReqs = u.open_request_count + u.completed_request_count + u.rejected_request_count;
                const userRejRate = totalReqs > 0 ? Math.round((u.rejected_request_count / totalReqs) * 100) : 0;
                return (
                  <tr key={u.id} className="hover:bg-canvas-parchment/30">
                    <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-ink-muted48" /> {u.name}
                    </td>
                    <td className="py-3 px-3 text-ink-muted48">{u.contact_info}</td>
                    <td className="py-3 px-3 text-center font-medium">{u.open_request_count}</td>
                    <td className="py-3 px-3 text-center font-semibold text-[#248a3d]">{u.completed_request_count}</td>
                    <td className="py-3 px-3 text-center font-semibold text-[#d70015]">{u.rejected_request_count}</td>
                    <td className="py-3 px-3 text-center font-medium">
                      <span className={userRejRate > 0 ? 'text-[#d70015] font-semibold' : 'text-ink-muted80'}>
                        {userRejRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.verified ? (
                        <VerifiedBadge size="sm" />
                      ) : u.rejected_request_count > 2 ? (
                        <span className="px-2 py-0.5 rounded-pill text-[10px] bg-[#fff2f2] text-[#d70015] font-semibold border border-[#ffb3b8]">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-muted48">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Category & Status Breakdown Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-canvas border border-border-hairline rounded-lg p-6">
          <h3 className="text-[17px] font-semibold text-ink mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Waste Stream Clearance Volumes
          </h3>
          <div className="space-y-3">
            {categoryCounts.map(cat => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-ink">{cat.category}</span>
                    <span className="text-ink-muted48">{cat.count} requests ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-canvas-parchment rounded-pill overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-pill transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-canvas border border-border-hairline rounded-lg p-6">
          <h3 className="text-[17px] font-semibold text-ink mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#248a3d]" /> Curbside Clearance Pipeline Status
          </h3>
          <div className="space-y-3">
            {statusCounts.map(st => {
              const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
              return (
                <div key={st.status} className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-ink">{st.status}</span>
                    <span className="text-ink-muted48">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-canvas-parchment rounded-pill overflow-hidden">
                    <div
                      className={`h-full rounded-pill transition-all ${
                        st.status === 'Completed' ? 'bg-[#16793f]' : st.status === 'Rejected' ? 'bg-[#dc2626]' : 'bg-primary'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Master Request Table with Search, Date Range Filter & Collector Reassignment */}
      <div className="bg-canvas border border-border-hairline rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border-soft">
          <div>
            <h3 className="text-[17px] font-semibold text-ink">Central Municipal Dispatch &amp; Grievance Directory</h3>
            <p className="text-[13px] text-ink-muted48">Search, filter by stream or date range, and reassign SWaCH collection vans</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input per Design.md */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-ink-muted48 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search location or citizen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-canvas text-ink text-[13px] border border-border-hairline rounded-pill pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-canvas text-ink text-[13px] border border-border-hairline rounded-sm px-3 py-2 focus:outline-none"
            >
              <option value="all">All Waste Streams</option>
              {['Organic', 'Plastic', 'Paper', 'E-Waste', 'Medical', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-canvas text-ink text-[13px] border border-border-hairline rounded-sm px-3 py-2 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {['Submitted', 'Assigned', 'On the Way', 'Completed', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Date Range Filters */}
            <div className="flex items-center gap-1.5 text-[12px] bg-canvas-parchment p-1 rounded-sm border border-border-hairline">
              <Calendar className="w-3.5 h-3.5 text-ink-muted48 ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
                className="bg-transparent text-ink text-[12px] focus:outline-none"
              />
              <span className="text-ink-muted48">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
                className="bg-transparent text-ink text-[12px] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-soft text-ink-muted48 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Stream</th>
                <th className="py-3 px-3">Location &amp; Citizen</th>
                <th className="py-3 px-3">Scheduled Date</th>
                <th className="py-3 px-3">EXIF / GPS Verification</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Van / Collector</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {filteredRequests.map(r => (
                <tr key={r.id} className="hover:bg-canvas-parchment/40">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-ink">{r.waste_category}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-ink">{r.pickup_location}</div>
                    <div className="text-[11px] text-ink-muted48">{r.user_name || r.user_id}</div>
                  </td>
                  <td className="py-3 px-3 text-ink-muted80 whitespace-nowrap">
                    {r.pickup_date}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {r.photo_exif_present ? (
                        <span className="px-2 py-0.5 rounded-pill text-[10px] bg-emerald-50 text-[#16793f] font-semibold border border-emerald-200">
                          EXIF Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-pill text-[10px] bg-red-50 text-[#dc2626] font-semibold border border-red-200">
                          No EXIF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[12px] font-medium text-ink">
                      {r.status}
                    </span>
                    {r.rejection_reason && (
                      <span className="block text-[11px] text-[#d70015] italic truncate max-w-[150px]">
                        {r.rejection_reason}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {r.collector_name ? (
                      <div className="flex items-center gap-1.5 text-ink font-medium">
                        <Truck className="w-3.5 h-3.5 text-primary" />
                        <span>{r.collector_name}</span>
                      </div>
                    ) : (
                      <span className="text-ink-muted48 italic">Unassigned Pool</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setReassigningReq(r);
                        setSelectedCollectorId(r.collector_id || '');
                      }}
                      className="text-primary hover:underline font-medium text-[12px]"
                    >
                      Reassign Beat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collector Reassignment Modal */}
      {reassigningReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas border border-border-hairline rounded-lg w-full max-w-[440px] p-6 space-y-4">
            <h3 className="text-[18px] font-semibold text-ink">
              Reassign Beat Van / Collector
            </h3>
            <p className="text-[13px] text-ink-muted48">
              Allocate an authorized SWaCH sanitary vehicle for pickup at <strong>{reassigningReq.pickup_location}</strong>
            </p>

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">
                Assign Beat Collector
              </label>
              <select
                value={selectedCollectorId}
                onChange={(e) => setSelectedCollectorId(e.target.value)}
                className="w-full bg-canvas text-ink text-[14px] border border-border-hairline rounded-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Leave Unassigned (Return to Ward Pool) --</option>
                {collectors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.contact_info})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-border-soft">
              <button
                onClick={() => setReassigningReq(null)}
                className="btn-pearl-capsule text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                className="btn-primary text-[13px] px-5"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
