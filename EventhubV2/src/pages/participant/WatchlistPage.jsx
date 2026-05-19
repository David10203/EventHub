// src/pages/participant/WatchlistPage.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../api/api';
import { EmptyState, PageHeader } from '../../components/UI';

// Map raw API event fields → shape expected by the card/modal
const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const mapEvent = (e, isfavorite) => ({
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
  category:         e.categoryName,
  categoryId:       e.categoryId,
  organizerId:      e.organizerId,
  isAccepted:       e.isAccepted,
  attachmentFileName: e.attachmentFileName ?? null,
  isfavorite,
});

// ── Inline event card (no EventCard component so we fully control the heart) ──
const FavCard = ({ event, onRemove, onOpen, removing }) => {
  const soldOut = event.availableTickets === 0;
  const pct     = event.totalTickets > 0
    ? Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100)
    : 0;

  return (
    <div className="eh-card h-100" style={{ borderRadius: 16, overflow: 'hidden' }}>

      {/* Image area */}
      <div style={{ position: 'relative', height: 190, cursor: 'pointer' }} onClick={() => onOpen(event)}>
        <img src={toImgSrc(event.image)} alt={event.title} className="event-img"/>

        {/* Category pill */}
        {event.category && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(79,70,229,.88)', color: '#fff',
            padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 600,
          }}>
            {event.category}
          </span>
        )}

        {/* ❤️ Heart — always red because isfavorite = true for all items here */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(event.id); }}
          disabled={removing === event.id}
          title="Remove from watchlist"
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(255,255,255,.9)', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, cursor: removing === event.id ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            transition: 'transform .15s',
            opacity: removing === event.id ? .5 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          {removing === event.id
            ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }}/>
            : '❤️'   /* always red — isfavorite is always true on this page */
          }
        </button>

        {/* Sold out overlay */}
        {soldOut && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="badge bg-danger px-3 py-2" style={{ fontSize: '.85rem', letterSpacing: 1 }}>
              SOLD OUT
            </span>
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
      <div className="p-3" style={{ cursor: 'pointer' }} onClick={() => onOpen(event)}>
        <h6 className="fw-bold mb-1" style={{ fontSize: '.95rem', lineHeight: 1.3 }}>{event.title}</h6>
        <p className="text-muted small mb-1">
          <i className="bi bi-geo-alt me-1"/>{event.venue}
        </p>
        <p className="text-muted small mb-2">
          <i className="bi bi-calendar3 me-1"/>{event.date}
          {event.time && <span className="ms-2"><i className="bi bi-clock me-1"/>{event.time}</span>}
        </p>

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

// ── Main page ─────────────────────────────────────────────────────────────────
const WatchlistPage = () => {
  const { toggleWatchlist, setWatchlist } = useApp();

  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [removing,  setRemoving]  = useState(null);
  const [selected,  setSelected]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/Users/GetFavorites');
        if (cancelled) return;
        const favItems = data
          .filter(i => i.isfavorite)
          .map(i => mapEvent(i.event, i.isfavorite));
        setFavorites(favItems);
        // Seed global watchlist IDs so hearts stay red on EventsPage
        setWatchlist(favItems.map(e => e.id));
      } catch {
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  // Remove from watchlist — call API then remove from local list
  const handleRemove = async (eventId) => {
    setRemoving(eventId);
    try {
      await toggleWatchlist(eventId);              // handles API + toast + global watchlist update
      setFavorites(prev => prev.filter(e => e.id !== eventId));
    } finally {
      setRemoving(null);
    }
  };

  // Open detail modal — try to fetch full details, fallback to list data
  const handleOpen = async (event) => {
    try {
      const { data } = await api.get(`/Events/${event.id}`);
      setSelected(mapEvent(data, true));
    } catch {
      setSelected(event);
    }
  };

  return (
    <div className="container py-4">
      <PageHeader
        title="❤️ My Watchlist"
        subtitle={
          loading
            ? 'Loading...'
            : `${favorites.length} saved event${favorites.length !== 1 ? 's' : ''}`
        }
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }}/>
          <p className="text-muted mt-2">Loading your watchlist...</p>
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="💔"
          title="Your watchlist is empty"
          subtitle="Click the ❤️ on any event card to save it here"
        />
      ) : (
        <div className="row g-4">
          {favorites.map(event => (
            <div key={event.id} className="col-12 col-sm-6 col-lg-4">
              <FavCard
                event={event}
                onRemove={handleRemove}
                onOpen={handleOpen}
                removing={removing}
              />
            </div>
          ))}
        </div>
      )}

      {/* Simple detail panel — swap for EventDetailModal if you prefer */}
      {selected && (
        <div
          className="modal show d-block"
          style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div style={{ position: 'relative', height: 220 }}>
                <img src={toImgSrc(selected.image)} alt={selected.title} className="event-img"/>
                <button
                  className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2"
                  onClick={() => setSelected(null)}
                />
              </div>
              <div className="p-4">
                <h5 className="fw-bold mb-1">{selected.title}</h5>
                <p className="text-muted small mb-2">
                  <i className="bi bi-geo-alt me-1"/>{selected.venue} &nbsp;·&nbsp;
                  <i className="bi bi-calendar3 me-1"/>{selected.date}
                </p>
                <p className="mb-3">{selected.description}</p>
                <div className="d-flex gap-2">
                  <span className="badge bg-light text-dark border">
                    {selected.price === 0 ? 'FREE' : `EGP ${selected.price}`}
                  </span>
                  <span className="badge bg-light text-dark border">
                    {selected.availableTickets} tickets left
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;