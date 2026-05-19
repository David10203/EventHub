// src/pages/organizer/OrgDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar, PageHeader, StatusBadge } from '../../components/UI';
import api from '../../api/api';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const StatCard = ({ icon, label, value, color }) => (
  <div className="col-6 col-md-3">
    <div className="stat-card" style={{ background: color }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{value}</div>
      <div style={{ opacity: .8, fontSize: '.85rem' }}>{label}</div>
    </div>
  </div>
);

const OrgDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [events, setEvents] = useState([]);
  const [salesStats, setSalesStats] = useState({ totalSold: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. جلب الفعاليات وفلترتها حسب المنظم الحالي[cite: 14, 15]
        const eventsRes = await api.get('/Events');
        const myEvents = eventsRes.data.filter(e => String(e.organizerId) === String(user?.id));
        // ترتيب تنازلي حسب الـ ID أو التاريخ لعرض الأحدث
        setEvents(myEvents.sort((a, b) => b.id - a.id));

        // 2. جلب إحصائيات المبيعات من الـ API الثاني
        // ملاحظة: استبدل المسار بالـ Endpoint الصحيح لديك
        const statsRes = await api.get(`/Events/GetDashboardAnalytics`);
        setSalesStats({
          totalSold: statsRes.data.ticketSold || 0,
          totalRevenue: statsRes.data.revenue || 0
        });

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) fetchData();
  }, [user]);

  // حساب العدادات الأساسية
  const approved = events.filter(e => e.isAccepted === 1);
  const pending = events.filter(e => e.isAccepted === 0);

  const stats = [
  { 
    icon: '🎭', 
    label: 'Total Events',   
    value: events.length, 
    color: 'linear-gradient(135deg,#4f46e5,#7c3aed)' 
  },
  { 
    icon: '✅', 
    label: 'Approved',        
    value: approved.length, 
    color: 'linear-gradient(135deg,#059669,#10b981)' 
  },
  { 
    icon: '⏳', 
    label: 'Pending Review',  
    value: pending.length, 
    color: 'linear-gradient(135deg,#d97706,#f59e0b)' 
  },
  { 
    icon: '🎫', 
    label: 'Tickets Sold',    
    value: salesStats.totalSold.toLocaleString(), 
    color: 'linear-gradient(135deg,#6366f1,#a855f7)' // لون بنفسجي مميز
  },
  { 
    icon: '💰', 
    label: 'Total Revenue',   
    value: `EGP ${salesStats.totalRevenue.toLocaleString()}`, 
    color: 'linear-gradient(135deg,#be185d,#ec4899)' 
  },
];

  return (
    <div className="container py-4">
      {/* Welcome */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <Avatar name={user?.name} size={52}/>
        <div>
          <h4 className="fw-bold mb-0">Welcome, {user?.name?.split(' ')[0]}! 👋</h4>
          <p className="text-muted mb-0 small">Organizer Dashboard</p>
        </div>
        <button className="btn btn-brand rounded-3 fw-semibold ms-md-auto" onClick={() => navigate('/create-event')}>
          <i className="bi bi-plus-lg me-2"/>New Event
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
        {/* إضافة كارت إضافي لإجمالي التذاكر المباعة إذا أردت */}
        {/* <div className="col-12 mt-2">
           <div className="eh-card p-2 px-3 d-flex align-items-center justify-content-between bg-light border-0">
              <span className="small fw-semibold text-muted">Total Tickets Sold:</span>
              <span className="fw-bold text-primary">{salesStats.totalSold} Tickets</span>
           </div>
        </div> */}
      </div>

      {/* Recent events - تم تعديل العرض ليظهر آخر 3 فقط[cite: 15] */}
      <div className="eh-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">My Last 3 Events</h6>
          <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => navigate('/my-events')}>
            View All <i className="bi bi-arrow-right ms-1"/>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></div>
        ) : events.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No events yet.</p>
            <button className="btn btn-brand rounded-3" onClick={() => navigate('/create-event')}>
              <i className="bi bi-plus me-1"/>Create your first event
            </button>
          </div>
        ) : (
          // استخدام slice(0, 3) لعرض آخر 3 فعاليات فقط[cite: 15]
          events.slice(0, 3).map(e => (
            <div key={e.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
              <img src={toImgSrc(e.image)} alt="" style={{ width: 48, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}/>
              <div className="flex-fill">
                <p className="fw-semibold small mb-0">{e.title}</p>
                <p className="text-muted mb-0" style={{ fontSize: '.75rem' }}>
                  {e.date?.slice(0, 10)} · {e.numberOfTickets - e.availableTickets} sold / {e.numberOfTickets}
                </p>
              </div>
              <StatusBadge status={e.isAccepted ? 'approved' : 'pending'}/>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrgDashboardPage;