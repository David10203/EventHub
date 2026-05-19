// src/pages/admin/AdminEventsPage.jsx
import { useState, useEffect } from 'react';
import api from '../../api/api';
import { StatusBadge, ConfirmModal, PageHeader } from '../../components/UI';
import EventDetailModal from '../../components/EventDetailModal';
import toast from 'react-hot-toast';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const AdminEventsPage = () => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving,  setSaving]  = useState(null);

  // ── جيب كل الـ events ─────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/Events')
      .then(res => setEvents(res.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  // ── map الـ fields ─────────────────────────────────────────────────────────
  const mapped = events.map(e => ({
    id:               e.id,
    title:            e.title,
    description:      e.description,
    location:         e.location,
    venue:            e.location,
    price:            e.ticketPrice,
    totalTickets:     e.numberOfTickets,
    availableTickets: e.availableTickets,
    image:            e.image,
    date:             e.date?.slice(0, 10),
    time:             e.date?.slice(11, 16),
    organizer:        e.organizerName,
    organizerId:      e.organizerId,
    category:         e.categoryName,
    categoryId:       e.categoryId,
    isAccepted:       e.isAccepted,
    status:           e.isAccepted === 1  ? 'approved'
                    : e.isAccepted === -1 ? 'rejected'
                    : 'pending',
    attachmentFileName: e.attachmentFileName ?? null,   // used by EventDetailModal /Photo download
  }));

  // ── Approve ────────────────────────────────────────────────────────────────
  const approveEvent = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Events/AcceptEvent/${id}`);
      setEvents(prev => prev.map(e =>
        e.id === id ? { ...e, isAccepted: 1 } : e
      ));
      toast.success('Event approved!');
    } catch {
      toast.error('Failed to approve event');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Revoke ─────────────────────────────────────────────────────────────────
  const revokeEvent = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Events/RevokeEvent/${id}`);
      setEvents(prev => prev.map(e =>
        e.id === id ? { ...e, isAccepted: 0 } : e
      ));
      toast.error('Event Revoked');
    } catch {
      toast.error('Failed to Revoke event');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Reject (soft, sets status to -1) ──────────────────────────────────────
  const rejectEvent = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Events/RejectEvent/${id}`);
      setEvents(prev => prev.map(e =>
        e.id === id ? { ...e, isAccepted: -1 } : e
      ));
      toast.error('Event rejected');
    } catch {
      toast.error('Failed to reject event');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Delete (permanent) ─────────────────────────────────────────────────────
  const deleteEvent = async (id) => {
    setSaving(id);
    try {
      await api.delete(`/Events/DeleteEvent/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted successfully');
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'approve') approveEvent(confirm.id);
    else if (confirm.action === 'pending') revokeEvent(confirm.id);
    else if (confirm.action === 'reject') rejectEvent(confirm.id);
    else deleteEvent(confirm.id);
  };

  // ── Filter + Search ────────────────────────────────────────────────────────
  const filtered = mapped
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all:      mapped.length,
    pending:  mapped.filter(e => e.status === 'pending').length,
    approved: mapped.filter(e => e.status === 'approved').length,
    rejected: mapped.filter(e => e.status === 'rejected').length,
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }}/>
      <p className="text-muted mt-2">Loading events...</p>
    </div>
  );

  return (
    <div className="container py-4">
      <PageHeader
        title="🎭 Manage Events"
        subtitle="Review and approve event submissions from organizers"
      />

      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
        <div className="d-flex gap-1 flex-wrap">
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm rounded-pill text-capitalize ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}>
              {f}
              <span className={`ms-1 badge rounded-pill ${filter === f ? 'bg-white text-primary' : 'bg-secondary'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="ms-auto" style={{ minWidth: 220 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text rounded-start-3 border-end-0">
              <i className="bi bi-search text-muted"/>
            </span>
            <input className="form-control rounded-end-3 border-start-0"
              placeholder="Search events..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-5 eh-card p-4">
            <div style={{ fontSize: 48 }}>🔍</div>
            <p className="text-muted mt-2">No events found</p>
          </div>
        )}

        {filtered.map(event => {
          const sold = event.totalTickets - event.availableTickets;
          const isSaving = saving === event.id;

          return (
            <div key={event.id} className="eh-card p-3">
              <div className="d-flex gap-3 align-items-start flex-wrap">
                <img src={toImgSrc(event.image)} alt=""
                  style={{ width: 100, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setPreview(event)}/>

                <div className="flex-fill">
                  <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                    <div>
                      <h6 className="fw-bold mb-1"
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => setPreview(event)}>
                        {event.title}
                      </h6>
                      <p className="text-muted small mb-1">
                        <i className="bi bi-person me-1"/>by {event.organizer}
                        <span className="ms-2"><i className="bi bi-tag me-1"/>{event.category}</span>
                        <span className="ms-2"><i className="bi bi-geo-alt me-1"/>{event.venue}</span>
                      </p>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-calendar3 me-1"/>{event.date} · {event.time}
                        <span className="ms-2">
                          <i className="bi bi-ticket-perforated me-1"/>
                          {event.totalTickets} tickets · {event.price === 0 ? 'FREE' : `EGP ${event.price}`}
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={event.status}/>
                  </div>

                  {event.status === 'approved' && (
                    <div className="mt-2" style={{ maxWidth: 280 }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Tickets sold</span>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
                          {sold}/{event.totalTickets}
                        </span>
                      </div>
                      <div className="progress ticket-bar" style={{ height: 6, borderRadius: 4 }}>
                        <div className="progress-bar"
                          style={{ width: `${Math.round((sold / event.totalTickets) * 100)}%` }}/>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 flex-shrink-0 align-items-start">
                  <button className="btn btn-sm btn-outline-secondary rounded-3"
                    onClick={() => setPreview(event)}>
                    <i className="bi bi-eye me-1"/>Preview
                  </button>

                  {event.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-success rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'approve' })}>
                        {isSaving
                          ? <span className="spinner-border spinner-border-sm"/>
                          : <><i className="bi bi-check-lg me-1"/>Approve</>
                        }
                      </button>
                      <button className="btn btn-sm btn-warning rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'reject' })}>
                        <i className="bi bi-x-circle me-1"/>Reject
                      </button>
                      <button className="btn btn-sm btn-danger rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'delete' })}>
                        <i className="bi bi-trash me-1"/>Delete
                      </button>
                    </>
                  )}

                  {event.status === 'approved' && (
                    <>
                      <button className="btn btn-sm btn-outline-danger rounded-3"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'pending' })}>
                        <i className="bi bi-slash-circle me-1"/>Revoke
                      </button>
                      <button className="btn btn-sm btn-warning rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'reject' })}>
                        <i className="bi bi-x-circle me-1"/>Reject
                      </button>
                      <button className="btn btn-sm btn-danger rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'delete' })}>
                        <i className="bi bi-trash me-1"/>Delete
                      </button>
                    </>  
                  )}

                  {event.status === 'rejected' && (
                    <>
                      <button className="btn btn-sm btn-success rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'approve' })}>
                        <i className="bi bi-check-lg me-1"/>Approve
                      </button>
                      <button className="btn btn-sm btn-danger rounded-3 fw-semibold"
                        disabled={isSaving}
                        onClick={() => setConfirm({ id: event.id, action: 'delete' })}>
                        <i className="bi bi-trash me-1"/>Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {preview && <EventDetailModal event={preview} onClose={() => setPreview(null)}/>}

      {confirm && (
        <ConfirmModal
          title={
            confirm.action === 'approve' ? 'Approve Event?' : 
            confirm.action === 'pending' ? 'Revoke Approval?' : 
            confirm.action === 'reject'  ? 'Reject Event?' :
            'Delete Event?'
          }
          message={
            confirm.action === 'approve' ? 'This event will become visible to all participants and they can start booking tickets.' : 
            confirm.action === 'pending' ? 'This event will be moved back to pending. It will be hidden from participants but not deleted.' : 
            confirm.action === 'reject'  ? 'This event will be marked as rejected and hidden from participants. The organizer will be notified.' :
            'This action is permanent. The event and all its associated data will be removed from the database.'
          }
          confirmLabel={
            confirm.action === 'approve' ? 'Yes, Approve' : 
            confirm.action === 'pending' ? 'Yes, Revoke' : 
            confirm.action === 'reject'  ? 'Yes, Reject' :
            'Yes, Delete Permanently'
          }
          danger={confirm.action === 'reject' || confirm.action === 'pending' || confirm.action === 'delete'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminEventsPage;