// src/pages/participant/EventsPage.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../api/api';
import EventCard from '../../components/EventCard';
import EventDetailModal from '../../components/EventDetailModal';
// import { CATEGORIES } from '../../data/mockData';

const EventsPage = () => {
  const { user } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [loc, setLoc] = useState('All');
  const [sort, setSort] = useState('date');
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);

  // ── جيب الـ events من الـ API ─────────────────────────────────────────────
  useEffect(() => {
    api.get('/Events')
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));

    api.get('/Category')
      .then(res => setCategories(res.data))
      .catch(() => toast.error('Failed to load categories'));

  }, []);

  // ── map الـ fields من الـ API للـ names اللي بيستخدمها الكود ───────────────
  const mapped = events.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    venue: e.location,       // الـ API مفيهاش venue بيجي location
    price: e.ticketPrice,
    totalTickets: e.numberOfTickets,
    availableTickets: e.availableTickets,
    image: e.image,
    date: e.date?.slice(0, 10),
    time: e.date?.slice(11, 16),
    organizer: e.organizerName,
    category: e.categoryName,
    status: 'approved',       // اللي بييجي من الـ API approved بالفعل
  }));

  const locations = ['All', ...new Set(mapped.map(e => e.location).filter(Boolean))];

  const filtered = mapped
    .filter(e => cat === 'All' || e.category === cat)
    .filter(e => loc === 'All' || e.location === loc)
    .filter(e =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.toLowerCase().includes(search.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) =>
    sort === 'date' ? new Date(a.date) - new Date(b.date) :
      sort === 'price' ? a.price - b.price :
        sort === 'name' ? a.title?.localeCompare(b.title) : 0
  );

  return (
    <div className="container-fluid py-4 px-4">

      {/* Hero banner */}
      <div className="rounded-4 mb-4 p-4 p-md-5 text-white" style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#312e81 60%,#4f46e5 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
        }} />
        <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.6rem,4vw,2.5rem)' }}>
          Discover Amazing Events 🎉
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', marginBottom: '1.5rem' }}>
          Find tech talks, concerts, workshops, and more across Egypt
        </p>
        <div className="input-group" style={{ maxWidth: 540 }}>
          <span className="input-group-text border-0 rounded-start-3"
            style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }}>
            <i className="bi bi-search" />
          </span>
          <input className="form-control border-0 rounded-end-3"
            style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }}
            placeholder="Search events, venues, organizers..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <div className="d-flex gap-1 flex-wrap">
          <button
            onClick={() => setCat('All')}
            className={`btn btn-sm rounded-pill ${cat === 'All' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '.78rem' }}
          >
            All
          </button>

          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.name)}
              className={`btn btn-sm rounded-pill ${cat === c.name ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ fontSize: '.78rem' }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="ms-auto d-flex gap-2">
          <select className="form-select form-select-sm rounded-3" value={loc} onChange={e => setLoc(e.target.value)}>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="form-select form-select-sm rounded-3" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date">By Date</option>
            <option value="price">By Price</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </div>

      <p className="text-muted small mb-3">
        <i className="bi bi-grid-3x3-gap me-1" />
        {sorted.length} event{sorted.length !== 1 ? 's' : ''} found
      </p>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p className="text-muted mt-2">Loading events...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="row g-4">
          {sorted.map(event => (
            <div key={event.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <EventCard event={event} onClick={setSelected} />
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="col-12 text-center py-5">
              <div style={{ fontSize: 52 }}>🔍</div>
              <h5 className="text-muted fw-bold mt-2">No events found</h5>
              <p className="text-muted small">Try changing filters or search term</p>
            </div>
          )}
        </div>
      )}

      {selected && <EventDetailModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default EventsPage;