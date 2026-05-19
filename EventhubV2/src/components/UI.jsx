// src/components/UI.jsx  — shared, reusable components

import { useState } from 'react';

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '?', size = 36 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const palette  = ['#4f46e5','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444'];
  const color    = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status}`}>{status}</span>
);

// ── QR Code (SVG) ─────────────────────────────────────────────────────────────
export const QRCode = ({ value = 'QR', size = 130 }) => {
  const cells = 21;
  const cell  = size / cells;
  const seed  = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bit   = (r, c) => {
    // fixed corner squares
    if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) return true;
    return (seed * (r + 1) * (c + 1) * 31) % 5 < 2;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#fff"/>
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          bit(r, c) ? <rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill="#1e293b"/> : null
        )
      )}
      {/* Corner squares overlay */}
      {[[0,0],[0,14],[14,0]].map(([r,c], i) => (
        <g key={i}>
          <rect x={c*cell} y={r*cell} width={7*cell} height={7*cell} fill="none" stroke="#1e293b" strokeWidth={cell}/>
          <rect x={(c+2)*cell} y={(r+2)*cell} width={3*cell} height={3*cell} fill="#1e293b"/>
        </g>
      ))}
    </svg>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) => (
  <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)', zIndex: 1060 }} onClick={onCancel}>
    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
      <div className="modal-content border-0 shadow-lg rounded-4">
        <div className="modal-body p-4 text-center">
          <div style={{ fontSize: 40, marginBottom: 8 }}>{danger ? '⚠️' : '❓'}</div>
          <h5 className="fw-bold">{title}</h5>
          <p className="text-muted mb-4">{message}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onCancel}>Cancel</button>
            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} rounded-3 px-4`} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title = 'Nothing here', subtitle = '' }) => (
  <div className="text-center py-5">
    <div style={{ fontSize: 52, marginBottom: 12 }}>{icon}</div>
    <h5 className="fw-bold text-muted">{title}</h5>
    {subtitle && <p className="text-muted small">{subtitle}</p>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border" style={{ color: 'var(--primary)' }}/>
  </div>
);

// ── Stars ─────────────────────────────────────────────────────────────────────
export const Stars = ({ rating, onChange }) => (
  <div className="d-flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} onClick={() => onChange?.(s)}
        style={{ background: 'none', border: 'none', fontSize: 22, cursor: onChange ? 'pointer' : 'default', padding: 0, lineHeight: 1 }}>
        {s <= rating ? '⭐' : '☆'}
      </button>
    ))}
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
    <div>
      <h4 className="fw-bold mb-0">{title}</h4>
      {subtitle && <p className="text-muted mb-0 mt-1 small">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
