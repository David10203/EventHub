// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';

// Layout
import Navbar    from './components/Navbar';
import AuthModal from './components/AuthModal';

// Participant
import EventsPage    from './pages/participant/EventsPage';
import MyTicketsPage from './pages/participant/MyTicketsPage';
import WatchlistPage from './pages/participant/WatchlistPage';
import CartPage      from './pages/participant/CartPage';

// Organizer
import OrgDashboardPage from './pages/organizer/OrgDashboardPage';
import MyEventsPage     from './pages/organizer/MyEventsPage';
import CreateEventPage  from './pages/organizer/CreateEventPage';
import AnalyticsPage    from './pages/organizer/AnalyticsPage';

// Admin
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage    from './pages/admin/AdminEventsPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';

// Shared
import ProfilePage from './pages/ProfilePage';

// ── Scroll to top on route change ────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
};

// ── Protected Route ───────────────────────────────────────────────────────────
const Protected = ({ allowed, children }) => {
  const { user } = useApp();
  if (!user)                        return <Navigate to="/" replace/>;
  if (!allowed.includes(user.role)) return <Navigate to="/" replace/>;
  return children;
};

// ── Layout (wraps every page) ─────────────────────────────────────────────────
const Layout = () => {
  const [authMode, setAuthMode] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onLoginClick={setAuthMode}/>

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<EventsPage/>}/>

          {/* Participant */}
          <Route path="/my-tickets" element={<Protected allowed={['participant']}><MyTicketsPage/></Protected>}/>
          <Route path="/watchlist"  element={<Protected allowed={['participant']}><WatchlistPage/></Protected>}/>
          <Route path="/cart"       element={<Protected allowed={['participant']}><CartPage/></Protected>}/>

          {/* Organizer */}
          <Route path="/org-dashboard" element={<Protected allowed={['EventOrganizer']}><OrgDashboardPage/></Protected>}/>
          <Route path="/my-events"     element={<Protected allowed={['EventOrganizer']}><MyEventsPage/></Protected>}/>
          <Route path="/create-event"  element={<Protected allowed={['EventOrganizer']}><CreateEventPage/></Protected>}/>
          {/* <Route path="/analytics"     element={<Protected allowed={['EventOrganizer']}><AnalyticsPage/></Protected>}/> */}
          <Route path="/edit-event/:id" element={<Protected allowed={['EventOrganizer']}><CreateEventPage/></Protected>}/>

          {/* Admin */}
          <Route path="/admin-dashboard" element={<Protected allowed={['Admin']}><AdminDashboardPage/></Protected>}/>
          <Route path="/admin-events"    element={<Protected allowed={['Admin']}><AdminEventsPage/></Protected>}/>
          <Route path="/admin-users"     element={<Protected allowed={['Admin']}><AdminUsersPage/></Protected>}/>
          <Route path="/admin-roles" element={<Protected allowed={['Admin']}><AdminRolesPage/></Protected>
}/>

          {/* Shared */}
          {/* <Route path="/profile" element={<Protected allowed={['Admin','EventOrganizer','participant']}><ProfilePage/></Protected>}/> */}

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>

      <footer style={{
        background: 'linear-gradient(135deg,#0f172a,#1e293b)',
        color: 'rgba(255,255,255,.45)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '.82rem',
      }}>
        <p className="mb-0">
          © 2026 <span style={{ color: '#818cf8', fontWeight: 600 }}>EventHub</span>
          {' '}— Built with React + Bootstrap · 🎫
        </p>
      </footer>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)}/>}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: 12, fontSize: '.88rem' },
        }}
      />
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop/>
        <Layout/>
      </AppProvider>
    </BrowserRouter>
  );
}
