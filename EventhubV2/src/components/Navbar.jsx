// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from './UI';

const Navbar = ({ onLoginClick }) => {
  const { user, logout, cart, notifications, markAllRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // States للتحكم في القوائم المنسدلة
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Refs لاكتشاف الضغط خارج القوائم
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // إغلاق القوائم عند الضغط في أي مكان خارجها
  useEffect(() => {
    const handler = (e) => {
      // إغلاق قائمة الإشعارات
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      // إغلاق قائمة المستخدم
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // روابط التنقل بناءً على الدور
  const guestLinks = [{ label: 'Browse Events', path: '/' }];
  const participantLinks = [
    { label: 'Events', path: '/' },
    { label: 'My Tickets', path: '/my-tickets' },
    { label: 'Watchlist', path: '/watchlist' },
  ];
  const organizerLinks = [
    { label: 'Dashboard', path: '/org-dashboard' },
    { label: 'My Events', path: '/my-events' },
    // { label: 'Analytics', path: '/analytics' },
    { label: 'Create', path: '/create-event' },
  ];
  const adminLinks = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Events', path: '/admin-events' },
    { label: 'Users', path: '/admin-users' },
    { label: 'Roles', path: '/admin-roles' },
  ];

  const links = !user ? guestLinks
    : user.role === 'Admin' ? adminLinks
    : user.role === 'EventOrganizer' ? organizerLinks
    : participantLinks;

  const nav = (path) => { 
    navigate(path); 
    setMenuOpen(false); 
    setUserMenuOpen(false); // نغلق القائمة عند الانتقال
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
      borderBottom: '2px solid #4f46e5',
      zIndex: 999,
    }}>
      <div className="container-fluid px-4">

        {/* Brand */}
        <button className="btn border-0 p-0 me-3" onClick={() => nav('/')}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
            Event<span style={{ color: '#818cf8' }}>Hub</span>
            <span style={{ fontSize: '1.2rem', marginLeft: 4 }}>🎫</span>
          </span>
        </button>

        {/* Mobile: cart + toggle */}
        <div className="d-flex d-lg-none align-items-center gap-2">
          {user?.role === 'participant' && (
            <button className="btn btn-sm position-relative" style={{ color: '#fff', background: 'rgba(255,255,255,.08)', borderRadius: 8 }}
              onClick={() => nav('/cart')}>
              <i className="bi bi-cart3"/>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '.6rem' }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button className="navbar-toggler border-0 text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`bi bi-${menuOpen ? 'x-lg' : 'list'}`} style={{ fontSize: 22 }}/>
          </button>
        </div>

        <div className={`navbar-collapse ${menuOpen ? 'show' : 'collapse'}`}>
          {/* Nav links */}
          <ul className="navbar-nav me-auto gap-1 py-2 py-lg-0">
            {links.map(l => (
              <li className="nav-item" key={l.path}>
                <button onClick={() => nav(l.path)}
                  className="btn border-0 px-3 py-2 rounded-3"
                  style={{
                    color: location.pathname === l.path ? '#fff' : 'rgba(255,255,255,.65)',
                    background: location.pathname === l.path ? 'rgba(99,102,241,.35)' : 'transparent',
                    fontWeight: location.pathname === l.path ? 600 : 400,
                    fontSize: '.9rem', transition: 'all .2s',
                  }}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">

            {/* Cart — participant only */}
            {user?.role === 'participant' && (
              <button className="btn btn-sm rounded-3 border-0 position-relative d-none d-lg-flex align-items-center gap-1"
                style={{ color: '#fff', background: 'rgba(255,255,255,.08)', padding: '6px 12px' }}
                onClick={() => nav('/cart')}>
                <i className="bi bi-cart3"/>
                <span style={{ fontSize: '.82rem' }}>Cart</span>
                {cartCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: '.65rem' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications */}
            {user && (
              <div className="position-relative" ref={notifRef}>
                <button className="btn btn-sm rounded-3 border-0 position-relative"
                  style={{ color: '#fff', background: 'rgba(255,255,255,.08)', width: 38, height: 38 }}
                  onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); markAllRead(); }}>
                  <i className="bi bi-bell"/>
                  {unread > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '.6rem' }}>
                      {unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="dropdown-menu show shadow-lg border-0 p-2"
                    style={{ right: 0, left: 'auto', minWidth: 290, borderRadius: 14, top: 44, zIndex: 9999 }}>
                    <p className="fw-bold small px-2 mb-2 text-muted">Notifications</p>
                    {notifications.length === 0 && (
                      <p className="text-center text-muted small py-2">All caught up!</p>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className="px-2 py-2 rounded-3 d-flex gap-2"
                        style={{ background: n.read ? 'transparent' : 'rgba(99,102,241,.06)' }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                          background: n.read ? '#cbd5e1' : '#4f46e5',
                        }}/>
                        <div>
                          <p className="mb-0 small">{n.text}</p>
                          <p className="mb-0 text-muted" style={{ fontSize: '.7rem' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User menu or auth buttons */}
            {user ? (
              <>
                {/* Desktop: avatar dropdown */}
                <div className="dropdown d-none d-lg-block" ref={userMenuRef}>
                  <button className="btn border-0 d-flex align-items-center gap-2 p-0" 
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}>
                    <Avatar name={user.name} size={34}/>
                    <div className="text-start">
                      <div style={{ color: '#fff', fontSize: '.82rem', fontWeight: 600, lineHeight: 1.1 }}>{user.name}</div>
                      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.68rem', textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                    <i className="bi bi-chevron-down text-white" style={{ fontSize: '.7rem' }}/>
                  </button>

                  {/* الـ Menu يظهر هنا بناءً على الـ State */}
                  {userMenuOpen && (
                    <ul className="dropdown-menu show dropdown-menu-end shadow border-0 rounded-4 mt-2" 
                        style={{ minWidth: 200, position: 'absolute', right: 0, top: '100%' }}>
                      <li>
                        <div className="px-3 py-2 border-bottom mb-1">
                          <p className="fw-bold mb-0 small">{user.name}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>{user.email}</p>
                        </div>
                      </li>
                      {/* <li><button className="dropdown-item rounded-3" onClick={() => nav('/profile')}><i className="bi bi-person me-2"/>Profile</button></li> */}
                      {user.role === 'participant' && (
                        <>
                          <li><button className="dropdown-item rounded-3" onClick={() => nav('/my-tickets')}><i className="bi bi-ticket-perforated me-2"/>My Tickets</button></li>
                          <li><button className="dropdown-item rounded-3" onClick={() => nav('/watchlist')}><i className="bi bi-heart me-2"/>Watchlist</button></li>
                          <li><button className="dropdown-item rounded-3" onClick={() => nav('/cart')}>
                            <i className="bi bi-cart3 me-2"/>Cart
                            {cartCount > 0 && <span className="badge bg-danger ms-1">{cartCount}</span>}
                          </button></li>
                        </>
                      )}
                      <li><hr className="dropdown-divider my-1"/></li>
                      <li>
                        <button className="dropdown-item text-danger rounded-3 fw-semibold" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"/>Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Mobile: inline links */}
                <div className="d-lg-none border-top pt-2 mt-1 w-100">
                  <div className="d-flex align-items-center gap-2 px-1 pb-2 border-bottom mb-2">
                    <Avatar name={user.name} size={32}/>
                    <div>
                      <p className="fw-bold mb-0 small" style={{ color: '#fff' }}>{user.name}</p>
                      <p className="mb-0" style={{ color: 'rgba(255,255,255,.5)', fontSize: '.7rem', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                  </div>
                  {/* <button className="btn border-0 w-100 text-start px-2 py-1 rounded-3 mb-1"
                    style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem' }}
                    onClick={() => nav('/profile')}>
                    <i className="bi bi-person me-2"/>Profile
                  </button> */}
                  <button className="btn border-0 w-100 text-start px-2 py-1 rounded-3 fw-semibold"
                    style={{ color: '#f87171', fontSize: '.9rem' }}
                    onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"/>Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-sm rounded-3 border-white text-white px-3" style={{ borderWidth: 1 }}
                  onClick={() => onLoginClick('login')}>Login</button>
                <button className="btn btn-sm btn-brand rounded-3 px-3"
                  onClick={() => onLoginClick('register')}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;