// src/pages/participant/CartPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, EmptyState, Spinner } from '../../components/UI';

// ── Payment Modal ────────────────────────────────────────────────────────────
const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const PaymentModal = ({ total, onConfirm, onClose, loading }) => {
  const [form, setForm] = useState({
    cardName:   '',
    cardNumber: '',
    expiry:     '',
    cvv:        '',
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' })); // clear error on type
  };

  // Format card number as XXXX XXXX XXXX XXXX
  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    set('cardNumber', formatted);
  };

  // Format expiry as MM/YY
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
    set('expiry', formatted);
  };

  const validate = () => {
    const e = {};

    if (!form.cardName.trim())
      e.cardName = 'Name on card is required';

    const digits = form.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits))
      e.cardNumber = 'Enter a valid 16-digit card number';

    const [mm, yy] = (form.expiry.split('/'));
    const month = parseInt(mm, 10);
    const year  = parseInt('20' + yy, 10);
    const now   = new Date();
    if (!/^\d{2}\/\d{2}$/.test(form.expiry) || month < 1 || month > 12)
      e.expiry = 'Enter a valid expiry (MM/YY)';
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
      e.expiry = 'This card has expired';

    if (!/^\d{3,4}$/.test(form.cvv))
      e.cvv = 'Enter a valid CVV (3 or 4 digits)';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onConfirm();
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? '#dc3545' : undefined,
  });

  return (
    <div
      className="modal show d-block"
      style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 20 }}>

          {/* Header */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 className="fw-bold mb-0">💳 Payment Details</h5>
              <p className="text-muted small mb-0">Your total is <strong>EGP {total}</strong></p>
            </div>
            <button className="btn-close" onClick={onClose} disabled={loading}/>
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">

            {/* Card name */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Name on Card</label>
              <input
                className="form-control rounded-3"
                placeholder="Ahmed Mohamed"
                value={form.cardName}
                onChange={e => set('cardName', e.target.value)}
                style={inputStyle('cardName')}
                disabled={loading}
              />
              {errors.cardName && <div className="text-danger small mt-1">{errors.cardName}</div>}
            </div>

            {/* Card number */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Card Number</label>
              <div className="position-relative">
                <input
                  className="form-control rounded-3"
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={handleCardNumber}
                  style={{ paddingRight: 48, ...inputStyle('cardNumber') }}
                  disabled={loading}
                />
                <span style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 20, pointerEvents: 'none',
                }}>
                  {form.cardNumber.startsWith('4') ? '💳' :
                   form.cardNumber.startsWith('5') ? '💳' : '💳'}
                </span>
              </div>
              {errors.cardNumber && <div className="text-danger small mt-1">{errors.cardNumber}</div>}
            </div>

            {/* Expiry + CVV */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Expiry Date</label>
                <input
                  className="form-control rounded-3"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={handleExpiry}
                  style={inputStyle('expiry')}
                  disabled={loading}
                />
                {errors.expiry && <div className="text-danger small mt-1">{errors.expiry}</div>}
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">CVV</label>
                <input
                  className="form-control rounded-3"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={form.cvv}
                  onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={inputStyle('cvv')}
                  disabled={loading}
                />
                {errors.cvv && <div className="text-danger small mt-1">{errors.cvv}</div>}
              </div>
            </div>

            {/* Secure note */}
            <div className="d-flex align-items-center gap-2 p-2 rounded-3 mb-2"
              style={{ background: 'var(--color-success-light, #f0faf0)', fontSize: 12 }}>
              <span>🔒</span>
              <span className="text-muted">Your payment info is encrypted and secure</span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
            <button
              className="btn btn-outline-secondary rounded-3 flex-fill"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-brand rounded-3 flex-fill fw-bold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"/>Processing...</>
                : `Pay EGP ${total}`
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Cart Page ────────────────────────────────────────────────────────────────
const CartPage = () => {
  const { cart, fetchCart, updateCartQty, removeFromCart, clearCart, checkoutCart } = useApp();
  const navigate = useNavigate();

  const [loadingCart,   setLoadingCart]   = useState(true);
  const [showPayment,   setShowPayment]   = useState(false);
  const [paying,        setPaying]        = useState(false);

  const total    = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const totalQty = cart.reduce((s, item) => s + item.qty, 0);

  // Load cart from DB on mount
  useEffect(() => {
    const load = async () => {
      setLoadingCart(true);
      await fetchCart();
      setLoadingCart(false);
    };
    load();
  }, []);

  const handleConfirmPayment = async () => {
    setPaying(true);
    const success = await checkoutCart();
    setPaying(false);
    if (success) {
      setShowPayment(false);
      navigate('/my-tickets');
    }
  };

  if (loadingCart) {
    return (
      <div className="container py-5 text-center">
        <Spinner/>
        <p className="text-muted mt-2">Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-4">
        <PageHeader title="🛒 My Cart"/>
        <EmptyState icon="🛒" title="Your cart is empty" subtitle="Browse events and add tickets to your cart"/>
        <div className="text-center mt-3">
          <button className="btn btn-brand rounded-3 px-4" onClick={() => navigate('/')}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <PageHeader
        title="🛒 My Cart"
        subtitle={`${cart.length} event${cart.length > 1 ? 's' : ''} · ${totalQty} ticket${totalQty > 1 ? 's' : ''}`}
      />

      <div className="row g-4">
        {/* Cart items */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            {cart.map(item => (
              <div key={item.eventId} className="eh-card p-3">
                <div className="d-flex gap-3">
                  <img
                    src={toImgSrc(item.image)} alt={item.title}
                    style={{ width: 90, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-fill">
                    <h6 className="fw-bold mb-1">{item.title}</h6>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-calendar3 me-1"/>{item.date}
                      <span className="ms-2"><i className="bi bi-geo-alt me-1"/>{item.venue}</span>
                    </p>
                    <p className="mb-2" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {item.price === 0 ? 'FREE' : `EGP ${item.price}`} / ticket
                    </p>

                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      {/* Qty control */}
                      <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted me-1">Qty:</span>
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle fw-bold"
                          style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
                          onClick={() => updateCartQty(item.eventId, item.qty - 1)}
                        >−</button>
                        <span className="fw-bold px-1">{item.qty}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle fw-bold"
                          style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
                          onClick={() => updateCartQty(item.eventId, item.qty + 1)}
                          disabled={item.qty >= Math.min(5, item.availableTickets)}
                        >+</button>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold" style={{ color: 'var(--primary)' }}>
                          {item.price === 0 ? 'FREE' : `EGP ${item.price * item.qty}`}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-3"
                          onClick={() => removeFromCart(item.eventId)}
                        >
                          <i className="bi bi-trash"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-outline-secondary rounded-3 mt-3 btn-sm" onClick={clearCart}>
            <i className="bi bi-trash me-1"/>Clear Cart
          </button>
        </div>

        {/* Order summary */}
        <div className="col-lg-4">
          <div className="eh-card p-4 sticky-top" style={{ top: 80 }}>
            <h6 className="fw-bold mb-3">Order Summary</h6>

            {cart.map(item => (
              <div key={item.eventId} className="d-flex justify-content-between mb-2">
                <span className="small text-muted" style={{ maxWidth: 160 }}>
                  {item.title} × {item.qty}
                </span>
                <span className="small fw-semibold">
                  {item.price === 0 ? 'FREE' : `EGP ${item.price * item.qty}`}
                </span>
              </div>
            ))}

            <hr/>

            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted small">Subtotal</span>
              <span className="fw-semibold">{total === 0 ? 'FREE' : `EGP ${total}`}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted small">Platform fee</span>
              <span className="fw-semibold text-success">FREE</span>
            </div>

            <div className="d-flex justify-content-between mb-4 pt-2 border-top">
              <span className="fw-bold">Total</span>
              <span className="fw-bold" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                {total === 0 ? 'FREE' : `EGP ${total}`}
              </span>
            </div>

            <button
              className="btn btn-brand w-100 rounded-3 fw-bold py-2"
              onClick={() => setShowPayment(true)}
              disabled={paying}
            >
              <i className="bi bi-credit-card me-2"/>Proceed to Payment
            </button>
            <button
              className="btn btn-outline-secondary w-100 rounded-3 mt-2"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-1"/>Continue Browsing
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          loading={paying}
          onConfirm={handleConfirmPayment}
          onClose={() => !paying && setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default CartPage;