// src/pages/participant/MyTicketsPage.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState, PageHeader, Spinner } from '../../components/UI';
import api from '../../api/api';
import toast from 'react-hot-toast';

// ── مكون عرض الـ QR ──────────────────────────────────────────────────────
const QRImage = ({ base64, size = 140 }) => (
  <img
    src={`data:image/png;base64,${base64}`}
    alt="Ticket QR Code"
    width={size}
    height={size}
    style={{ borderRadius: 8, display: 'block', margin: '0 auto', objectFit: 'contain' }}
  />
);

// ── مكون النجوم ──────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="d-flex gap-1 justify-content-center">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        onClick={() => !readonly && onChange && onChange(star)}
        disabled={readonly}
        style={{
          background: 'none', border: 'none', padding: '2px',
          cursor: readonly ? 'default' : 'pointer',
          fontSize: 26,
          color: star <= value ? '#f59e0b' : '#d1d5db',
          transition: 'all .1s ease',
          lineHeight: 1,
          transform: !readonly && star <= value ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        ★
      </button>
    ))}
  </div>
);

// ── نافذة تفاصيل التذكرة (Modal) ──────────────────────────────────────────
const TicketModal = ({ ticket, onClose }) => (
  <div
    className="modal show d-block"
    style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)', zIndex: 1060 }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 370 }}>
      <div className="modal-content border-0 shadow-lg ticket-card">
        <div className="ticket-header text-center p-4 bg-primary text-white rounded-top-4">
          <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={onClose}/>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎫</div>
          <h5 className="fw-bold mb-1">{ticket.title}</h5>
          <p className="small mb-0" style={{ opacity: 0.9 }}>
            <i className="bi bi-geo-alt me-1"/>{ticket.location}
          </p>
        </div>
        <div className="ticket-perforation" style={{ backgroundColor: '#f8f9fa' }}/>
        <div className="p-4 text-center bg-white rounded-bottom-4">
          <div className="qr-wrapper mb-3 p-2 border rounded-3 bg-light d-inline-block">
            <QRImage base64={ticket.qrBytes} size={180}/>
          </div>
          <p className="fw-bold mb-1 text-primary" style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: 2 }}>
            #{ticket.id}
          </p>
          <p className="text-muted small mb-0">📅 {ticket.dateLabel || ticket.date?.slice(0,10)}</p>
          <div className="mt-3 py-2 border-top">
             <span className="badge bg-success-subtle text-success px-3">Valid Ticket</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MyTicketsPage = () => {
  const { tickets, fetchTickets } = useApp();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [selected, setSelected] = useState(null);
  const [localRatings, setLocalRatings] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTickets();
      setLoading(false);
    };
    load();
  }, []);

  const isPast = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // 1. منطق الترتيب: القادم أولاً ثم المنتهي
  const sortedTickets = [...tickets].sort((a, b) => {
    const aPast = isPast(a.date);
    const bPast = isPast(b.date);
    if (aPast !== bPast) return aPast ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  // 2. منطق الفلترة
  const filteredTickets = sortedTickets.filter(t => {
    if (filter === 'Upcoming') return !isPast(t.date);
    if (filter === 'Past') return isPast(t.date);
    return true;
  });

  const submitRating = async (ticketId, eventId) => {
    const val = localRatings[ticketId]?.value;
    if (!val) return toast.error('Please select a star rating');

    setLocalRatings(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], submitting: true } }));
    try {
      await api.post(`/Users/AddRate/${eventId}/${val}`);
      toast.success('Rating submitted! ⭐');
      await fetchTickets(); // لتحديث البيانات وعرض الريتنج القادم من السيرفر
    } catch (err) {
      setLocalRatings(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], submitting: false } }));
      toast.error(err?.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <Spinner />
      <p className="text-muted mt-2">Loading your tickets...</p>
    </div>
  );

  return (
    <div className="container py-4">
      <PageHeader 
        title="🎫 My Tickets" 
        subtitle={`${tickets.length} total bookings`} 
      />

      {/* أزرار الفلترة */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {['All', 'Upcoming', 'Past'].map(opt => (
          <button 
            key={opt} 
            onClick={() => setFilter(opt)}
            className={`btn btn-sm rounded-pill px-4 fw-semibold ${filter === opt ? 'btn-primary' : 'btn-outline-secondary'}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <EmptyState icon="🎫" title="No tickets found" subtitle="Browse events to find your next experience!" />
      ) : (
        <div className="row g-4">
          {filteredTickets.map((ticket) => {
            const eventEnded = isPast(ticket.date);
            const apiRating = ticket.rating || 0;
            const isRated = apiRating > 0;
            const currentLocal = localRatings[ticket.id] ?? {};
            const displayStar = currentLocal.hover || currentLocal.value || apiRating;

            return (
              <div key={ticket.id} className="col-12 col-lg-6">
                <div className={`ticket-card card h-100 shadow-sm border-0 ${eventEnded ? 'bg-light opacity-90' : ''}`}>
                  
                  {/* الرأس */}
                  <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 px-3">
                    <div className="text-start">
                      <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>TICKET ID</span>
                      <span className="fw-bold text-dark" style={{ fontFamily: 'monospace' }}>#{ticket.id}</span>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${eventEnded ? 'bg-secondary' : 'bg-success-subtle text-success'}`}>
                      {eventEnded ? 'Event Ended' : 'Valid'}
                    </span>
                  </div>

                  <div className="ticket-perforation" />

                  {/* المحتوى */}
                  <div className="card-body px-3">
                    <h5 className="fw-bold text-dark mb-2">{ticket.title}</h5>
                    <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
                      <span><i className="bi bi-calendar3 me-1 text-primary"/>{ticket.dateLabel || ticket.date?.slice(0,10)}</span>
                      <span><i className="bi bi-geo-alt me-1 text-primary"/>{ticket.location}</span>
                    </div>

                    <div className="border-top pt-3 mt-auto">
                      {eventEnded ? (
                        /* حالة الانتهاء: ريتنج */
                        <div className="text-center py-1">
                          {isRated ? (
                            <div className="animate__animated animate__fadeIn">
                              <p className="text-muted small mb-1 fw-semibold">Your Experience</p>
                              <StarRating value={apiRating} readonly />
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-4 border shadow-sm">
                              <div 
                                onMouseLeave={() => setLocalRatings(prev => ({ ...prev, [ticket.id]: { ...prev[ticket.id], hover: 0 } }))}
                              >
                                <StarRating 
                                  value={displayStar} 
                                  onChange={(v) => setLocalRatings(prev => ({ ...prev, [ticket.id]: { ...prev[ticket.id], value: v, hover: 0 } }))} 
                                />
                              </div>
                              <button 
                                className="btn btn-warning btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                disabled={!currentLocal.value || currentLocal.submitting}
                                onClick={() => submitRating(ticket.id, ticket.eventId)}
                              >
                                {currentLocal.submitting ? '...' : 'Rate'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* حالة الانتظار: QR */
                        <div className="d-flex justify-content-between align-items-center">
                          <div 
                            className="bg-white p-1 rounded-2 border" 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => setSelected(ticket)}
                          >
                            <QRImage base64={ticket.qrBytes} size={48} />
                          </div>
                          <button 
                            className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
                            onClick={() => setSelected(ticket)}
                          >
                            <i className="bi bi-qr-code me-2"/>View Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <TicketModal ticket={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default MyTicketsPage;