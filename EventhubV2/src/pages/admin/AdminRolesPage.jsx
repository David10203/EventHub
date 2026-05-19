// src/pages/admin/AdminRolesPage.jsx
import { useState, useEffect } from 'react';
import api from '../../api/api';
import { PageHeader } from '../../components/UI';
import toast from 'react-hot-toast';

const AdminRolesPage = () => {
  const [roles,       setRoles]       = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(null); // id الـ role اللي بيتسيف
  
  // نسخة مؤقتة من التغييرات قبل الـ save
  const [draft, setDraft] = useState({}); 
  // { roleId: [permId, permId, ...] }

  // ── جيب الداتا ────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get('/Roles'),
      api.get('/Permissions/getAllPermissions'),
    ])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data);
        setPermissions(permsRes.data);

        // ابني الـ draft من الـ permissions الحالية لكل role
        const initialDraft = {};
        rolesRes.data.forEach(role => {
          initialDraft[role.id] = role.permissions?.map(p => p.id) || [];
        });
        setDraft(initialDraft);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  // ── toggle permission في الـ draft (مش بيحفظ لحد ما يدوس save) ────────────
  const togglePermission = (roleId, permId) => {
    setDraft(prev => {
      const current = prev[roleId] || [];
      const exists  = current.includes(permId);
      return {
        ...prev,
        [roleId]: exists
          ? current.filter(id => id !== permId)
          : [...current, permId],
      };
    });
  };

  // ── save التغييرات لـ role معينة ──────────────────────────────────────────
  const saveRole = async (role) => {
  setSaving(role.id);

  const newPerms = draft[role.id] || [];

  try {
    await api.post(`/Permissions/AssignPermissionToRole/${role.id}?${newPerms.map(p => `permissions=${p}`).join('&')}`);

    setRoles(prev => prev.map(r =>
      r.id === role.id
        ? { ...r, permissions: permissions.filter(p => newPerms.includes(p.id)) }
        : r
    ));

    toast.success(`${role.name} permissions updated!`);
  } catch {
    toast.error('Failed to save changes');
    setDraft(prev => ({
      ...prev,
      [role.id]: role.permissions?.map(p => p.id) || [],
    }));
  } finally {
    setSaving(null);
  }
};

  // ── في الـ draft اتغير حاجه؟ ──────────────────────────────────────────────
  const hasChanges = (role) => {
    const originalPerms = role.permissions?.map(p => p.id).sort().join(',') || '';
    const draftPerms    = (draft[role.id] || []).sort().join(',');
    return originalPerms !== draftPerms;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }}/>
      <p className="text-muted mt-2">Loading roles...</p>
    </div>
  );

  return (
    <div className="container py-4">
      <PageHeader
        title="🔐 Roles & Permissions"
        subtitle="Select permissions for each role then press Save"
      />

      <div className="row g-4">
        {roles.map(role => {
          const draftPerms = draft[role.id] || [];
          const changed    = hasChanges(role);

          return (
            <div key={role.id} className="col-12 col-lg-6">
              <div className="eh-card h-100">

                {/* Role header */}
                <div className="p-4 border-bottom d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, fontSize: 20,
                      background: role.name === 'Admin'          ? '#fee2e2' :
                                  role.name === 'EventOrganizer' ? '#dbeafe' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {role.name === 'Admin'          ? '🛡️' :
                       role.name === 'EventOrganizer' ? '🎭' : '🙋'}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{role.name}</h6>
                      <p className="text-muted mb-0 small">
                        {draftPerms.length} permission{draftPerms.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    className={`btn btn-sm rounded-3 fw-semibold ${changed ? 'btn-brand' : 'btn-outline-secondary'}`}
                    style={{ minWidth: 90 }}
                    disabled={!changed || saving === role.id}
                    onClick={() => saveRole(role)}>
                    {saving === role.id
                      ? <><span className="spinner-border spinner-border-sm me-1"/>Saving...</>
                      : changed ? '💾 Save' : '✓ Saved'
                    }
                  </button>
                </div>

                {/* Permissions checkboxes */}
                <div className="p-4">
                  <div className="d-flex flex-column gap-2">
                    {permissions.map(perm => {
                      const checked = draftPerms.includes(perm.id);
                      return (
                        <label key={perm.id}
                          className="d-flex align-items-center gap-3 p-3 rounded-3"
                          style={{
                            cursor: 'pointer',
                            background: checked ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${checked ? '#bbf7d0' : '#e2e8f0'}`,
                            transition: 'all .2s',
                          }}>
                          <input
                            type="checkbox"
                            className="form-check-input m-0"
                            style={{ width: 20, height: 20, cursor: 'pointer' }}
                            checked={checked}
                            onChange={() => togglePermission(role.id, perm.id)}/>
                          <div className="d-flex align-items-center gap-2 flex-fill">
                            <span style={{ fontSize: 18 }}>
                              {perm.name === 'Add'    ? '➕' :
                               perm.name === 'Update' ? '✏️' :
                               perm.name === 'Delete' ? '🗑️' : '🔑'}
                            </span>
                            <span className="fw-semibold small">{perm.name}</span>
                          </div>
                          {checked && (
                            <span className="badge bg-success">Active</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Unsaved changes warning */}
                  {changed && (
                    <div className="mt-3 p-2 rounded-3 d-flex align-items-center gap-2"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <i className="bi bi-exclamation-triangle text-warning"/>
                      <span className="small text-warning fw-semibold">Unsaved changes</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRolesPage;