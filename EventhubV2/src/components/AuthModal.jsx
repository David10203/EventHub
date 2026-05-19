// src/components/AuthModal.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AuthModal = ({ mode, onClose }) => {
  const { login, register } = useApp();
  const [tab,     setTab]     = useState(mode);
  const [role,    setRole]    = useState('participant');
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // فورم الـ login
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const setL = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));

  // فورم الـ register
  const [regForm, setRegForm] = useState({ Fname: '', Lname: '', email: '', password: '' });
  const setR = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const roleMap = { participant: 3, organizer: 2 };

  const handleSubmit = async () => {
    setErr('');
    try {
      setLoading(true);

      if (tab === 'login') {
        if (!loginForm.email || !loginForm.password) { setErr('Please fill all fields'); return; }
        await login(loginForm.email, loginForm.password);
        onClose();

      } else {
        if (!regForm.Fname || !regForm.Lname || !regForm.email || !regForm.password) {
          setErr('Please fill all fields'); return;
        }
        await register(regForm.Fname, regForm.Lname, regForm.email, regForm.password, roleMap[role]);
        // بعد الـ register → افتح الـ login
        setRegForm({ Fname: '', Lname: '', email: '', password: '' });
        setRole('participant');
        setErr('');
        setTab('login');
      }

    } catch (e) {
      setErr(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#0f172a,#1e293b)',
            padding: '2rem', textAlign: 'center', position: 'relative',
          }}>
            <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={onClose}/>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎫</div>
            <h5 style={{ color: '#fff', fontWeight: 800, margin: 0 }}>
              {tab === 'login' ? 'Welcome Back!' : 'Join EventHub'}
            </h5>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.82rem', margin: '4px 0 0' }}>
              {tab === 'login' ? 'Sign in to your account' : 'Create a free account'}
            </p>
          </div>

          {/* Body */}
          <div className="p-4">

            {/* Tabs */}
            <div className="d-flex bg-light rounded-3 p-1 mb-3">
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr(''); }}
                  className={`btn btn-sm flex-fill rounded-3 text-capitalize fw-semibold ${tab === t ? 'shadow-sm' : ''}`}
                  style={{ background: tab === t ? '#fff' : 'transparent' }}>
                  {t === 'login' ? '🔑 Login' : '✨ Register'}
                </button>
              ))}
            </div>

            {/* Error */}
            {err && (
              <div className="alert alert-danger py-2 small rounded-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle"/>{err}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <input className="form-control rounded-3" type="email" placeholder="you@example.com"
                    value={loginForm.email} onChange={e => setL('email', e.target.value)}/>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <input 
                      className={`form-control ${!loginForm.password ? 'rounded-3' : 'rounded-start-3' }`} 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password} 
                      onChange={e => setL('password', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                    <span 
                      className={`input-group-text ${!loginForm.password ? 'd-none' : 'd-block' }`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">First Name</label>
                    <input className="form-control rounded-3" placeholder="Ahmed"
                      value={regForm.Fname} onChange={e => setR('Fname', e.target.value)}/>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Last Name</label>
                    <input className="form-control rounded-3" placeholder="Ali"
                      value={regForm.Lname} onChange={e => setR('Lname', e.target.value)}/>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <input className="form-control rounded-3" type="email" placeholder="you@example.com"
                    value={regForm.email} onChange={e => setR('email', e.target.value)}/>
                </div>
                <div className="mb-3">               
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <input 
                      className={`form-control ${!regForm.password ? 'rounded-3' : 'rounded-start-3' }`}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={regForm.password} 
                      onChange={e => setR('password', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                    <span 
                      className={`input-group-text ${!regForm.password ? 'd-none' : 'd-block' }`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">I want to:</label>
                  <div className="d-flex gap-2">
                    {[
                      {  value: 'participant', label: '🙋 Attend Events' },
                      { value: 'organizer',   label: '🎭 Host Events'   },
                    ].map(o => (
                      <button key={o.value} onClick={() => setRole(o.value)}
                        className={`btn btn-sm flex-fill rounded-3 fw-semibold ${role === o.value ? 'btn-primary' : 'btn-outline-secondary'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {role === 'organizer' && (
                    <p className="text-muted small mt-1">
                      <i className="bi bi-info-circle me-1"/>
                      Organizer accounts require admin approval before posting events.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit */}
            <button className="btn btn-brand w-100 rounded-3 fw-bold py-2"
              onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"/>Please wait...</>
                : tab === 'login' ? 'Login →' : 'Create Account →'
              }
            </button>

            {/* Switch tab hint */}
            <p className="text-center text-muted small mt-3 mb-0">
              {tab === 'login'
                ? <>Don't have an account? <button className="btn btn-link btn-sm p-0 fw-semibold" onClick={() => { setTab('register'); setErr(''); }}>Sign up</button></>
                : <>Already have an account? <button className="btn btn-link btn-sm p-0 fw-semibold" onClick={() => { setTab('login'); setErr(''); }}>Login</button></>
              }
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;