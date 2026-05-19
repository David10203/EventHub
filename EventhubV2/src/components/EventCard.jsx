// src/components/EventCard.jsx
import { useApp } from '../context/AppContext';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const EventCard = ({ event, onClick }) => {
  const { user, watchlist, toggleWatchlist } = useApp();
  const inWatch  = watchlist.includes(event.id);
  const soldOut  = event.availableTickets === 0;
  const pct      = Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);

  return (
    <div className="eh-card h-100" style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => onClick(event)}>

      {/* Image */}
      <div style={{ position: 'relative', height: 190 }}>
        <img src={toImgSrc(event.image)} alt={event.title} className="event-img"/>

        {/* Category pill */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(79,70,229,.88)', color: '#fff',
          padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 600,
        }}>
          {event.category}
        </span>

        {/* Watchlist btn */}
        {user?.role === 'participant' && (
          <button
            onClick={e => { e.stopPropagation(); toggleWatchlist(event.id); }}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(255,255,255,.9)', border: 'none',
              borderRadius: '50%', width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              transition: 'transform .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            {inWatch ? '❤️' : '🤍'}
          </button>
        )}

        {/* Sold out overlay */}
        {soldOut && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="badge bg-danger px-3 py-2" style={{ fontSize: '.85rem', letterSpacing: 1 }}>SOLD OUT</span>
          </div>
        )}

        {/* Price tag */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: event.price === 0 ? '#10b981' : 'var(--dark)',
          color: '#fff', padding: '3px 10px', borderRadius: 20,
          fontSize: '.75rem', fontWeight: 700,
        }}>
          {event.price === 0 ? 'FREE' : `EGP ${event.price}`}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h6 className="fw-bold mb-1" style={{ fontSize: '.95rem', lineHeight: 1.3 }}>{event.title}</h6>
        <p className="text-muted small mb-1">
          <i className="bi bi-geo-alt me-1"/>{event.venue}
        </p>
        <p className="text-muted small mb-2">
          <i className="bi bi-calendar3 me-1"/>{event.date}
          <span className="ms-2"><i className="bi bi-clock me-1"/>{event.time}</span>
        </p>

        {/* Ticket bar */}
        <div className="ticket-bar">
          <div className="d-flex justify-content-between mb-1">
            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
              {event.availableTickets} tickets left
            </span>
            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{pct}% sold</span>
          </div>
          <div className="progress" style={{ height: 5, borderRadius: 4 }}>
            <div className="progress-bar" style={{ width: `${pct}%` }}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;