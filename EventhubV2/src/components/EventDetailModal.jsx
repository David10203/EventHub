// src/components/EventDetailModal.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Stars, QRCode } from './UI';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const EventDetailModal = ({ event, onClose }) => {
  const { user, watchlist, toggleWatchlist, addToCart, reviews, addReview } = useApp();
  const navigate = useNavigate();
  const [qty,        setQty]        = useState(1);
  const [rating,     setRating]     = useState(5);
  const [reviewText, setReviewText] = useState('');

  const inWatch  = watchlist.includes(event.id);
  const soldOut  = event.availableTickets === 0;
  const eventReviews = reviews.filter(r => r.eventId === event.id);
  const userAlreadyReviewed = eventReviews.some(r => r.userId === user?.id);

  const handleAddToCart = () => {
    addToCart(event, qty);
    onClose();
    navigate('/cart');
  };

  const handleReview = () => {
    if (!reviewText) return;
    addReview(event.id, rating, reviewText);
    setReviewText('');
    setRating(5);
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* Hero image */}
          <div style={{ position: 'relative', height: 260 }}>
            <img src={toImgSrc(event.image)} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75),transparent)' }}/>
            <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={onClose}/>
            <div style={{ position: 'absolute', bottom: 16, left: 20, right: 100 }}>
              <span style={{
                background: 'rgba(99,102,241,.9)', color: '#fff',
                padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600,
              }}>{event.category}</span>
              <h4 style={{ color: '#fff', fontWeight: 800, marginTop: 6, marginBottom: 4 }}>{event.title}</h4>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.85rem', margin: 0 }}>
                <i className="bi bi-person me-1"/>by {event.organizer}
              </p>
            </div>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Left: info */}
              <div className="col-md-7">
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{event.description}</p>

                <div className="row g-2 mt-2">
                  {[
                    { icon: 'bi-calendar3',         label: `${event.date} · ${event.time}` },
                    { icon: 'bi-geo-alt',            label: event.venue },
                    { icon: 'bi-ticket-perforated',  label: `${event.availableTickets} / ${event.totalTickets} available` },
                  ].map((item, i) => (
                    <div key={i} className="col-12">
                      <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: '#f1f5f9' }}>
                        <i className={`bi ${item.icon} text-primary`}/>
                        <span style={{ fontSize: '.85rem' }}>{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Attachment — download from /Events/{id}/Photo */}
                {event.attachmentFileName && (
                  <div className="mt-3">
                    <p className="fw-semibold small mb-2"><i className="bi bi-paperclip me-1"/>Attachment</p>
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-2"
                      onClick={async () => {
                        try {
                          const res = await import('../../api/api').then(m => m.default.get(`/Events/${event.id}/Photo`, { responseType: 'blob' }));
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const a = document.createElement('a');
                          a.href = url;
                          a.setAttribute('download', event.attachmentFileName.split('/').pop());
                          document.body.appendChild(a); a.click(); a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch { alert('Could not download file'); }
                      }}
                    >
                      <i className="bi bi-file-earmark-arrow-down"/>
                      {event.attachmentFileName.split('/').pop()}
                    </button>
                  </div>
                )}

                {/* Reviews */}
                <div className="mt-4 pt-3 border-top">
                  {/* <h6 className="fw-bold mb-3">
                    <i className="bi bi-star me-1"/>Reviews ({eventReviews.length})
                  </h6>

                  {user?.role === 'participant' && !userAlreadyReviewed && (
                    <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid var(--border)' }}>
                      <p className="small fw-semibold mb-2">Leave a review:</p>
                      <Stars rating={rating} onChange={setRating}/>
                      <textarea className="form-control mt-2 rounded-3" rows={2}
                        placeholder="Write your review..."
                        value={reviewText} onChange={e => setReviewText(e.target.value)}/>
                      <button className="btn btn-sm btn-primary rounded-3 mt-2" onClick={handleReview}>Submit</button>
                    </div>
                  )} */}

                  <div className="d-flex flex-column gap-2">
                    {eventReviews.map(r => (
                      <div key={r.id} className="d-flex gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '.78rem', flexShrink: 0,
                        }}>
                          {r.userName.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold small">{r.userName}</span>
                            <Stars rating={r.rating}/>
                          </div>
                          <p className="mb-0 small text-muted mt-1">{r.text}</p>
                        </div>
                      </div>
                    ))}
                    {/* {eventReviews.length === 0 && <p className="text-muted small">No reviews yet. Be the first!</p>} */}
                  </div>
                </div>
              </div>

              {/* Right: booking */}
              <div className="col-md-5">
                <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: 10 }}>
                  <div className="card-body p-4 text-center">
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {event.price === 0 ? 'FREE' : `EGP ${event.price}`}
                    </div>
                    <p className="text-muted small mb-3">per ticket</p>

                    {!user && (
                      <p className="text-muted small"><i className="bi bi-lock me-1"/>Login to book tickets</p>
                    )}

                    {user?.role === 'participant' && (
                      <>
                        {soldOut ? (
                          <div className="badge bg-danger w-100 py-2 mb-3" style={{ fontSize: '.85rem' }}>SOLD OUT</div>
                        ) : (
                          <>
                            {/* Qty selector */}
                            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                              <button className="btn btn-sm btn-outline-secondary rounded-circle fw-bold"
                                style={{ width: 32, height: 32, padding: 0 }}
                                onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                              <span className="fw-bold" style={{ fontSize: '1.1rem', minWidth: 24 }}>{qty}</span>
                              <button className="btn btn-sm btn-outline-secondary rounded-circle fw-bold"
                                style={{ width: 32, height: 32, padding: 0 }}
                                onClick={() => setQty(q => Math.min(Math.min(5, event.availableTickets), q + 1))}>+</button>
                            </div>
                            <div className="mb-3 p-2 rounded-3 bg-light">
                              <span className="text-muted small">Subtotal: </span>
                              <span className="fw-bold" style={{ color: 'var(--primary)' }}>
                                {event.price === 0 ? 'FREE' : `EGP ${event.price * qty}`}
                              </span>
                            </div>
                            <button className="btn btn-brand w-100 rounded-3 fw-bold mb-2" onClick={handleAddToCart}>
                              <i className="bi bi-cart-plus me-2"/>Add to Cart
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => toggleWatchlist(event.id)}
                          className={`btn w-100 rounded-3 ${inWatch ? 'btn-danger' : 'btn-outline-secondary'}`}>
                          <i className={`bi bi-heart${inWatch ? '-fill' : ''} me-2`}/>
                          {inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                      </>
                    )}

                    <div className="mt-3 text-start">
                      <p className="small fw-semibold mb-2 text-muted">Event details:</p>
                      {[
                        { icon: 'bi-calendar3', val: event.date },
                        { icon: 'bi-clock',     val: event.time },
                        { icon: 'bi-geo-alt',   val: event.location || event.venue },
                        { icon: 'bi-people',    val: `${event.totalTickets} total seats` },
                      ].map((item, i) => (
                        <div key={i} className="d-flex gap-2 align-items-center mb-1">
                          <i className={`bi ${item.icon} text-primary`} style={{ fontSize: '.85rem' }}/>
                          <span className="small">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;