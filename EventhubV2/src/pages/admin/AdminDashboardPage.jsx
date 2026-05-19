// src/pages/admin/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, Avatar, PageHeader } from '../../components/UI';
import api from '../../api/api';
import toast from 'react-hot-toast';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="col-6 col-md-3">
    <div className="stat-card" style={{ background: color }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{value}</div>
      <div style={{ opacity: .8, fontSize: '.85rem' }}>{label}</div>
      {sub && <div style={{ opacity: .6, fontSize: '.72rem', marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    events: [],
    users: [],
    analytics: { revenue: 0, ticketSold: 0 }
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [eventsRes, usersRes, analyticsRes] = await Promise.all([
          api.get('/Events'),
          api.get('/Users/GetAllUsers'),
          api.get('/Users/GetAnalitycs')
        ]);

        setData({
          events: eventsRes.data || [],
          users: usersRes.data || [],
          analytics: analyticsRes.data || { revenue: 0, ticketSold: 0 }
        });
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // اللوجك الجديد بناءً على الـ Response المحدث لليوزرز
  const pendingEvents = data.events.filter(e => e.isAccepted === false);
  
  // المنظمين المعلقين: الدور "organizer" وحالة الموافقة false
  const pendingEventOrganizer = data.users.filter(u => 
    u.roleName?.toLowerCase() === 'eventorganizer' && u.isApproved === false
  );

  const pendingParticipant = data.users.filter(u => 
    u.roleName?.toLowerCase() === 'participant' && u.isApproved === false
  );

  // حساب الأعداد بناءً على roleName من الـ API
  const participantsCount = data.users.filter(u => u.roleName?.toLowerCase() === 'participant').length;
  const organizersCount = data.users.filter(u => u.roleName?.toLowerCase() === 'eventorganizer').length;

  const stats = [
    {
      icon: '🎭', label: 'Total Events', value: data.events.length, color: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
      sub: `${pendingEvents.length} pending review`,
    },
    {
      icon: '👥', label: 'Total Users', value: data.users.length-1, color: 'linear-gradient(135deg,#059669,#10b981)',
      sub: `${organizersCount} Organizers - ${pendingEventOrganizer.length} pending / ${participantsCount} Participants - ${pendingParticipant.length} pending`,
    },
    {
      icon: '🎫', label: 'Tickets Sold', value: data.analytics.ticketSold.toLocaleString(), color: 'linear-gradient(135deg,#d97706,#f59e0b)',
      sub: 'All time',
    },
    {
      icon: '💰', label: 'Platform Revenue', value: `EGP ${(data.analytics.revenue * 0.05).toLocaleString()}`, color: 'linear-gradient(135deg,#be185d,#ec4899)',
      sub: '5% platform fee',
    },
  ];

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <PageHeader title="🛡️ Admin Dashboard" subtitle="Platform overview and management"/>

      <div className="row g-3 mb-4">
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      <div className="row g-4">
        {/* Pending Events */}
        <div className="col-12 col-lg-6">
          <div className="eh-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-clock-history me-2 text-warning"/>
                Pending Events
                {pendingEvents.length > 0 && (
                  <span className="badge bg-warning text-dark ms-2">{pendingEvents.length}</span>
                )}
              </h6>
              <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => navigate('/admin-events')}>
                View All <i className="bi bi-arrow-right ms-1"/>
              </button>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="text-center py-4">
                <div style={{ fontSize: 36 }}>✅</div>
                <p className="text-muted small mt-2">No pending events!</p>
              </div>
            ) : (
              pendingEvents.slice(0, 2).map(e => (
                <div key={e.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                  <img src={toImgSrc(e.image)} alt="" style={{ width: 46, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}/>
                  <div className="flex-fill">
                    <p className="fw-semibold small mb-0">{e.title}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>
                      by {e.organizerName} · {e.categoryName}
                    </p>
                  </div>
                  <StatusBadge status="pending"/>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Organizers */}
        <div className="col-12 col-lg-6">
          <div className="eh-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-person-check me-2 text-primary"/>
                Pending Organizers
                {pendingEventOrganizer.length > 0 && (
                  <span className="badge bg-primary ms-2">{pendingEventOrganizer.length}</span>
                )}
              </h6>
              <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => navigate('/admin-users')}>
                View All <i className="bi bi-arrow-right ms-1"/>
              </button>
            </div>

            {pendingEventOrganizer.length === 0 ? (
              <div className="text-center py-4">
                <div style={{ fontSize: 36 }}>✅</div>
                <p className="text-muted small mt-2">No pending accounts!</p>
              </div>
            ) : (
              pendingEventOrganizer.slice(0, 2).map(u => (
                <div key={u.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                  <Avatar name={u.name} size={38}/>
                  <div className="flex-fill">
                    <p className="fw-semibold small mb-0">{u.name}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>{u.email}</p>
                  </div>
                  <StatusBadge status="pending"/>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity summary */}
        <div className="col-12">
          <div className="eh-card p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-activity me-2 text-success"/>Platform Activity Summary
            </h6>
            <div className="row g-3">
              {[
                { icon: '🎫', text: `${data.analytics.ticketSold} tickets sold`, time: 'Total', color: '#4f46e5' },
                { icon: '✅', text: `${data.events.filter(e=>e.isAccepted===true).length} events live`, time: 'Currently', color: '#10b981' },
                { icon: '⏳', text: `${pendingEvents.length} events pending`, time: 'Review required', color: '#ef4444' },
                { icon: '👥', text: `${participantsCount} participants registered`, time: 'Total', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-3">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 18,
                      background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="fw-semibold small mb-0">{item.text}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '.7rem' }}>{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;