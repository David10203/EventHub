// src/pages/admin/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import api from '../../api/api';
import { Avatar, ConfirmModal, PageHeader } from '../../components/UI';
import toast from 'react-hot-toast';

const toImgSrc = (raw) => !raw ? '' : (raw.startsWith('http') || raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`);

const RoleBadge = ({ role }) => {
  const map = {
    Admin:          { bg: '#fee2e2', color: '#991b1b', label: '🛡️ Admin'         },
    EventOrganizer: { bg: '#dbeafe', color: '#1e40af', label: '🎭 Organizer'     },
    participant:    { bg: '#f3f4f6', color: '#374151', label: '🙋 Participant'    },
  };
  const s = map[role] || { bg: '#f3f4f6', color: '#374151', label: role };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '.72rem', fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
};

const StatusBadge = ({ isApproved }) => {
  if (isApproved === 1)  return <span className="status-badge status-approved">Approved</span>;
  if (isApproved === -1) return <span className="status-badge status-rejected">Rejected</span>;
  return <span className="status-badge status-pending">Pending</span>;
};

const AdminUsersPage = () => {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search,       setSearch]       = useState('');
  const [confirm,      setConfirm]      = useState(null);
  // { id, action: 'approve' | 'revoke' | 'delete' }
  const [expanded,     setExpanded]     = useState(null);
  const [saving,       setSaving]       = useState(null);

  // ── جيب كل اليوزرز ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/Users/GetAllUsers')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  // ── Approve ────────────────────────────────────────────────────────────────
  const approveUser = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Users/approve/${id}`);
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, isApproved: 1 } : u
      ));
      toast.success('User approved!');
    } catch {
      toast.error('Failed to approve user');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Revoke ─────────────────────────────────────────────────────────────────
  const revokeUser = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Users/RevokeUser/${id}`);
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, isApproved: 0 } : u
      ));
      toast('User revoked', { icon: '⚠️' });
    } catch {
      toast.error('Failed to revoke user');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const rejectUser = async (id) => {
    setSaving(id);
    try {
      await api.put(`/Users/RejectUser/${id}`);
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, isApproved: -1 } : u
      ));
      toast.error('User rejected');
    } catch {
      toast.error('Failed to reject user');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteUser = async (id) => {
    setSaving(id);
    try {
      await api.delete(`/Users/DeleteUser/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'approve') approveUser(confirm.id);
    if (confirm.action === 'revoke')  revokeUser(confirm.id);
    if (confirm.action === 'reject')  rejectUser(confirm.id);
    if (confirm.action === 'delete')  deleteUser(confirm.id);
  };

  // ── Filter + Search ────────────────────────────────────────────────────────
  const filtered = users
    .filter(u => roleFilter === 'all' || u.roleName === roleFilter)
    .filter(u => {
      if (statusFilter === 'all')      return true;
      if (statusFilter === 'approved') return u.isApproved === 1;
      if (statusFilter === 'pending')  return u.isApproved === 0;
      if (statusFilter === 'rejected') return u.isApproved === -1;
      return true;
    })
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    total:     users.length,
    admins:    users.filter(u => u.roleName === 'Admin').length,
    organizers:users.filter(u => u.roleName === 'EventOrganizer').length,
    participants: users.filter(u => u.roleName === 'participant').length,
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }}/>
      <p className="text-muted mt-2">Loading users...</p>
    </div>
  );

  return (
    <div className="container py-4">
      <PageHeader
        title="👥 Manage Users"
        subtitle="Approve organizer accounts and oversee all platform users"
      />

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users',   value: counts.total,        icon: '👥', color: '#4f46e5' },
          { label: 'Admins',        value: counts.admins,       icon: '🛡️', color: '#ef4444' },
          { label: 'Organizers',    value: counts.organizers,   icon: '🎭', color: '#3b82f6' },
          { label: 'Participants',  value: counts.participants, icon: '🙋', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="eh-card p-3 text-center">
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">

        {/* Role filter */}
        <div className="d-flex gap-1 flex-wrap">
          {[
            { value: 'all',            label: 'All'         },
            { value: 'Admin',          label: '🛡️ Admin'    },
            { value: 'EventOrganizer', label: '🎭 Organizer'},
            { value: 'Participant',    label: '🙋 Participant'},
          ].map(r => (
            <button key={r.value} onClick={() => setRoleFilter(r.value)}
              className={`btn btn-sm rounded-pill ${roleFilter === r.value ? 'btn-primary' : 'btn-outline-secondary'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="d-flex gap-1">
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn btn-sm rounded-pill text-capitalize ${statusFilter === s ? 'btn-dark' : 'btn-outline-secondary'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ms-auto" style={{ minWidth: 220 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text rounded-start-3 border-end-0">
              <i className="bi bi-search text-muted"/>
            </span>
            <input className="form-control rounded-end-3 border-start-0"
              placeholder="Search name or email..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="eh-card overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="border-0 py-3 ps-4">User</th>
                <th className="border-0 py-3">Role</th>
                <th className="border-0 py-3">Status</th>
                <th className="border-0 py-3">Events</th>
                <th className="border-0 py-3 pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">No users found</td>
                </tr>
              )}

              {filtered.map(u => {
                const isExpanded  = expanded === u.id;
                const isSaving    = saving === u.id;
                const hasEvents   = u.roleName === 'EventOrganizer' && u.organizedEvents?.length > 0;

                return (
                  <>
                    <tr key={u.id}
                      style={{ cursor: hasEvents ? 'pointer' : 'default', background: isExpanded ? '#f8fafc' : 'transparent' }}
                      onClick={() => hasEvents && setExpanded(isExpanded ? null : u.id)}>

                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={u.name} size={38}/>
                          <div>
                            <p className="fw-semibold small mb-0">{u.name}</p>
                            <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td><RoleBadge role={u.roleName}/></td>

                      <td><StatusBadge isApproved={u.isApproved}/></td>

                      <td>
                        {u.roleName === 'EventOrganizer' ? (
                          <span className="small fw-semibold" style={{ color: 'var(--primary)' }}>
                            {u.organizedEvents?.length || 0} event{u.organizedEvents?.length !== 1 ? 's' : ''}
                            {hasEvents && <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} ms-1`}/>}
                          </span>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>

                      <td className="pe-4">
                        <div className="d-flex gap-1 align-items-center" onClick={e => e.stopPropagation()}>

                          {/* Pending or Rejected → approve */}
                          {u.isApproved !== 1 && (
                            <button className="btn btn-sm btn-success rounded-3 fw-semibold"
                              disabled={isSaving}
                              onClick={() => setConfirm({ id: u.id, action: 'approve' })}>
                              {isSaving
                                ? <span className="spinner-border spinner-border-sm"/>
                                : <><i className="bi bi-check-lg me-1"/>Approve</>
                              }
                            </button>
                          )}

                          {/* Approved → revoke */}
                          {u.isApproved === 1 && u.roleName !== 'Admin' && (
                            <button className="btn btn-sm btn-outline-warning rounded-3"
                              disabled={isSaving}
                              onClick={() => setConfirm({ id: u.id, action: 'revoke' })}>
                              <i className="bi bi-slash-circle me-1"/>Revoke
                            </button>
                          )}

                          {/* Reject — ماعدا Admin */}
                          {u.isApproved !== -1 && u.roleName !== 'Admin' && (
                            <button className="btn btn-sm btn-warning rounded-3"
                              disabled={isSaving}
                              onClick={() => setConfirm({ id: u.id, action: 'reject' })}>
                              <i className="bi bi-x-circle me-1"/>Reject
                            </button>
                          )}

                          {/* Delete — للكل ماعدا Admin */}
                          {u.roleName !== 'Admin' && (
                            <button className="btn btn-sm btn-outline-danger rounded-3"
                              disabled={isSaving}
                              onClick={() => setConfirm({ id: u.id, action: 'delete' })}>
                              <i className="bi bi-trash"/>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>

                    {/* Expanded: organizer events */}
                    {isExpanded && hasEvents && (
                      <tr key={`${u.id}-exp`} style={{ background: '#f8fafc' }}>
                        <td colSpan={5} className="ps-4 pb-3">
                          <p className="small fw-semibold text-muted mb-2">Events by this organizer:</p>
                          <div className="d-flex flex-wrap gap-2">
                            {u.organizedEvents.map((e, i) => (
                              <div key={i} className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-white border">
                                <img src={toImgSrc(e.image)} alt=""
                                  style={{ width: 28, height: 24, borderRadius: 4, objectFit: 'cover' }}/>
                                <div>
                                  <p className="mb-0 small fw-semibold">{e.title}</p>
                                  <p className="mb-0" style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>
                                    {e.date?.slice(0, 10)}
                                  </p>
                                </div>
                                <span className={`status-badge ${e.isAccepted === 1 ? 'status-approved' : e.isAccepted === -1 ? 'status-rejected' : 'status-pending'}`}>
                                  {e.isAccepted === 1 ? 'Approved' : e.isAccepted === -1 ? 'Rejected' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          title={
            confirm.action === 'approve' ? 'Approve User?' :
            confirm.action === 'revoke'  ? 'Revoke Access?' :
            confirm.action === 'reject'  ? 'Reject User?' :
                                           'Delete User?'
          }
          message={
            confirm.action === 'approve' ? 'This user will be able to use the platform.' :
            confirm.action === 'revoke'  ? 'This user will lose access temporarily.' :
            confirm.action === 'reject'  ? 'This user will be marked as rejected and blocked from the platform.' :
                                           'This user will be permanently deleted from the database.'
          }
          confirmLabel={
            confirm.action === 'approve' ? 'Approve' :
            confirm.action === 'revoke'  ? 'Revoke'  :
            confirm.action === 'reject'  ? 'Reject'  :
                                           'Delete'
          }
          danger={confirm.action !== 'approve'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;