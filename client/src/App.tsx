import { useEffect, useState, useCallback } from 'react';
import { User, RequestItem } from './types';
import GlobalNav from './components/layout/GlobalNav';
import SubNav from './components/layout/SubNav';
import NationalPortalLanding from './components/home/NationalPortalLanding';
import RequestHistory from './components/user/RequestHistory';
import CreateRequestModal from './components/user/CreateRequestModal';
import WasteSortingGuide from './components/guide/WasteSortingGuide';
import CollectorView from './components/collector/CollectorView';
import AdminDashboard from './components/admin/AdminDashboard';
import RatingModal from './components/common/RatingModal';
import Toast, { ToastMessage } from './components/common/Toast';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'guide' | 'collector' | 'admin'>('home');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [ratingReq, setRatingReq] = useState<RequestItem | null>(null);
  const [ratingRole, setRatingRole] = useState<'user' | 'collector'>('user');

  // Simulated notification toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type: 'info'
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [usersRes, requestsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/requests/overview')
      ]);

      if (usersRes.ok) {
        const userData: User[] = await usersRes.json();
        setUsers(userData);
        // Default to Shreeyansh Mahamuni if none selected
        setCurrentUser(prev => {
          if (!prev) return userData.find(u => u.id === 'user_shreeyansh') || userData[0] || null;
          return userData.find(u => u.id === prev.id) || prev;
        });
      }

      if (requestsRes.ok) {
        const reqData: RequestItem[] = await requestsRes.json();
        setRequests(reqData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adjust active tab when role changes
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'collector') {
      setActiveTab('collector');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  // User's active open requests count
  const userOpenRequests = currentUser
    ? requests.filter(r => r.user_id === currentUser.id && !['Completed', 'Rejected'].includes(r.status)).length
    : 0;

  // User's own requests
  const userRequests = currentUser
    ? requests.filter(r => r.user_id === currentUser.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-canvas-parchment text-ink font-sans selection:bg-primary selection:text-white">
      {/* National Portal Header & Utility Bar */}
      <GlobalNav
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
      />

      {/* Sub Nav Frosted Glass - active on functional service tabs */}
      {activeTab !== 'home' && (
        <SubNav
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(t) => setActiveTab(t as any)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          openRequestCount={userOpenRequests}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* National Portal of India Style Landing Page */}
        {activeTab === 'home' && (
          <NationalPortalLanding
            currentUser={currentUser}
            requests={requests}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Citizen Doorstep Collection & History */}
        {activeTab === 'requests' && (
          <RequestHistory
            user={currentUser || users[0]}
            requests={userRequests}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onRateCollector={(req) => {
              setRatingReq(req);
              setRatingRole('user');
            }}
          />
        )}

        {/* Municipal Waste Sorting Guide */}
        {activeTab === 'guide' && <WasteSortingGuide />}

        {/* SWaCH Beat Collector Operations */}
        {activeTab === 'collector' && (
          <CollectorView
            collector={currentUser?.role === 'collector' ? currentUser : users.find(u => u.role === 'collector') || users[1]}
            allRequests={requests}
            onRefresh={() => {
              loadData();
              showToast('Status Updated', 'Pickup progress synced with municipal dispatch.');
            }}
            onOpenRating={(req) => {
              setRatingReq(req);
              setRatingRole('collector');
            }}
            onNotify={showToast}
          />
        )}

        {/* Municipal Admin Oversight Console */}
        {activeTab === 'admin' && (
          <AdminDashboard
            requests={requests}
            users={users}
            collectors={users.filter(u => u.role === 'collector')}
            onRefresh={() => {
              loadData();
              showToast('Ward Register Updated', 'Doorstep collection logs and curbside inspection records synced.');
            }}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Genuine Municipal Portal Footer */}
      <footer className="bg-canvas-parchment border-t border-border-hairline py-16 px-6 mt-20 text-ink">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-border-soft text-[13px]">
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink mb-3">
                Civic Services
              </h4>
              <ul className="space-y-2 text-ink-muted80">
                <li><button onClick={() => setActiveTab('requests')} className="hover:text-primary transition-colors text-left">Doorstep Waste Collection</button></li>
                <li><button onClick={() => setActiveTab('guide')} className="hover:text-primary transition-colors text-left">Source Segregation Guidelines</button></li>
                <li><span className="text-ink-muted48">Ward Collection Timetable</span></li>
                <li><span className="text-ink-muted48">Bulk Generator Registration</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink mb-3">
                Citizen Welfare &amp; Trust
              </h4>
              <ul className="space-y-2 text-ink-muted80">
                <li><span className="text-ink-muted48">Green Citizen Charter</span></li>
                <li><span className="text-ink-muted48">Community Sanitation Network</span></li>
                <li><span className="text-ink-muted48">Verified Segregator Badges</span></li>
                <li><span className="text-ink-muted48">Recycling Incentive Points</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink mb-3">
                Governance &amp; Compliance
              </h4>
              <ul className="space-y-2 text-ink-muted80">
                <li><span className="text-ink-muted48">Solid Waste Rules (SWM 2016)</span></li>
                <li><span className="text-ink-muted48">Plastic Waste Bylaws 2023</span></li>
                <li><span className="text-ink-muted48">E-Waste Disposal Protocols</span></li>
                <li><span className="text-ink-muted48">Pollution Control Board Standards</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink mb-3">
                Civic Helpdesk
              </h4>
              <ul className="space-y-2 text-ink-muted80">
                <li><span className="text-ink font-semibold">Toll-Free: 1800-103-0222</span></li>
                <li><span className="text-ink-muted80">Central Support Desk</span></li>
                <li><span className="text-ink-muted80">Email: support@SwachhaEco.app</span></li>
                <li><span className="text-ink-muted48">Mon–Sat: 06:30 AM – 08:30 PM</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-ink-muted48">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block"></span>
              <span>SwachhaEco • Solid Waste Management &amp; Resource Recovery Platform</span>
            </div>
            <div>
              <span>© 2026 SwachhaEco Initiative. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {currentUser && (
        <CreateRequestModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          userId={currentUser.id}
          openRequestCount={userOpenRequests}
          onSuccess={() => {
            loadData();
            showToast('Doorstep Collection Scheduled', 'Request submitted for curbside verification. Notification dispatched to Ward 12 beat supervisor.');
          }}
        />
      )}

      {/* Rating Modal */}
      {currentUser && ratingReq && (
        <RatingModal
          isOpen={!!ratingReq}
          onClose={() => setRatingReq(null)}
          request={ratingReq}
          raterRole={ratingRole}
          raterId={currentUser.id}
          onSuccess={() => {
            loadData();
            showToast('Rating Logged', 'Bidirectional feedback successfully recorded.');
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
