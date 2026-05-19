// src/pages/organizer/MyEventsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge, ConfirmModal, PageHeader } from '../../components/UI';
import api from '../../api/api'; // استيراد api لجلب البيانات مباشرة

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { user, deleteEvent } = useApp();
  const [events, setEvents] = useState([]); // State محلي لتخزين الفعاليات القادمة من الـ API
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');

  // جلب الفعاليات من السيرفر عند تحميل الصفحة
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api.get('/Events')
      .then(res => {
        const myEvents = res.data.filter(e =>
          String(e.organizerId) === String(user.id) ||
          (user.name && e.organizerName === user.name)
        );
        setEvents(myEvents);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // تحويل حالة isAccepted إلى المسميات المستخدمة في التصميم[cite: 14]
 const getStatus = (isAccepted) => {
  if (isAccepted == 0) {
    return 'pending';
  } else if (isAccepted == 1) {
    return 'approved';
  } else {
    return 'rejected';
  }
};

  const filtered = events.filter(e => {
    const status = getStatus(e.isAccepted);
    return filter === 'all' || status === filter;
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      // تحديث القائمة محلياً بعد الحذف[cite: 14]
      setEvents(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="container py-4">
      <PageHeader
        title="🎭 My Events"
        subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} created`}
        action={
          <button className="btn btn-brand rounded-3 fw-semibold" onClick={() => navigate('/create-event')}>
            <i className="bi bi-plus-lg me-1"/>Create Event
          </button>
        }
      />

      {/* Status filter */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'approved', 'pending', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm rounded-pill text-capitalize ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}>
            {f}
            <span className={`ms-1 badge rounded-pill ${filter === f ? 'bg-white text-primary' : 'bg-secondary'}`}>
              {f === 'all'
                ? events.length
                : events.filter(e => getStatus(e.isAccepted) === f).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 52 }}>📭</div>
          <h5 className="text-muted fw-bold mt-2">No events here</h5>
          <button className="btn btn-brand rounded-3 mt-2" onClick={() => navigate('/create-event')}>
            <i className="bi bi-plus me-1"/>Create your first event
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(event => {
            const status = getStatus(event.isAccepted);
            return (
              <div key={event.id} className="col-12">
                <div className="eh-card p-3">
                  <div className="d-flex gap-3 align-items-start flex-wrap">
                    <img src={toImgSrc(event.image)} alt=""
                      style={{ width: 90, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}/>

                    <div className="flex-fill">
                      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                        <div>
                          <h6 className="fw-bold mb-1">{event.title}</h6>
                          <p className="text-muted small mb-1">
                            <i className="bi bi-geo-alt me-1"/>{event.location}
                            <span className="ms-3"><i className="bi bi-calendar3 me-1"/>{event.date?.slice(0, 10)}</span>
                            <span className="ms-3"><i className="bi bi-tag me-1"/>{event.categoryName}</span>
                          </p>
                        </div>
                        <StatusBadge status={status}/>
                      </div>

                      {/* Mini stats باستخدام المسميات الجديدة من الـ API[cite: 2, 12, 14] */}
                      <div className="d-flex gap-4 mt-2">
                        <div>
                          <p className="mb-0 fw-bold" style={{ color: 'var(--primary)' }}>
                            {event.numberOfTickets - event.availableTickets} / {event.numberOfTickets}
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>Tickets Sold</p>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold" style={{ color: '#10b981' }}>
                            EGP {((event.numberOfTickets - event.availableTickets) * event.ticketPrice).toLocaleString()}
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>Revenue</p>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">
                            {event.ticketPrice === 0 ? 'FREE' : `EGP ${event.ticketPrice}`}
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>Per Ticket</p>
                        </div>
                      </div>

                      {status === 'pending' && (
                        <div className="mt-2">
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-clock me-1"/>Awaiting admin approval
                          </span>
                        </div>
                      )}

                      {status === 'rejected' && (
                        <div className="mt-2">
                          <span className="badge bg-danger">
                            <i className="bi bi-x-circle me-1"/>Rejected by admin — contact support for details
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 flex-shrink-0">
                      {/* ربط زر التعديل بالمسار الصحيح مع الـ ID */}
                      <button className="btn btn-sm btn-outline-primary rounded-3"
                        onClick={() => navigate(`/edit-event/${event.id}`)}>
                        <i className="bi bi-pencil"/>
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-3"
                        onClick={() => setDeleteId(event.id)}>
                        <i className="bi bi-trash"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default MyEventsPage;