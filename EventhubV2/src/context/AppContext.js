// src/context/AppContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_EVENTS, MOCK_USERS, MOCK_REVIEWS } from '../data/mockData';
import toast from 'react-hot-toast';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import * as signalR from '@microsoft/signalr';  // ← ADD THIS

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [events, setEvents]   = useState(MOCK_EVENTS);
  const [users,  setUsers]    = useState(MOCK_USERS);
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [watchlist, setWatchlist] = useState([]);

  const fetchWatchlist = async () => {
    try {
      const { data } = await api.get('/Users/GetFavorites');
      const ids = data.filter(i => i.isfavorite).map(i => i.event.id);
      setWatchlist(ids);
    } catch {
      // silently ignore
    }
  };

  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([
    
  ]);

  // ── SignalR: listen for admin-approved events (NEW) ───────────────────────
  useEffect(() => {
    if (!user) return;   // only connect when logged in

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.225.22.190:5000/hubs/events', {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('EventApproved', (event) => {
      // Push a new notification into the bell dropdown
      setNotifications(prev => [{
        id:      Date.now(),
        text:    `🎉 New event available: "${event.title}"`,
        time:    'just now',
        read:    false,
        eventId: event.eventId,
      }, ...prev]);

      // Also show a toast for users who are currently online
      toast.success(`New event: ${event.title} 🎉`, { duration: 5000 });
    });

    connection.start().catch(err =>
      console.error('SignalR connection error:', err)
    );

    return () => { connection.stop(); };
  }, [user]);   // reconnect when user logs in/out
  // ─────────────────────────────────────────────────────────────────────────

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/Auth/login', { email, password });
    const decoded  = jwtDecode(data.token);
    const userData = {
      name:        decoded.name,
      id:          decoded.userid,
      email:       decoded.email,
      role:        decoded.role,
      permissions: decoded.permission,
    };
    localStorage.setItem('token',        data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user',         JSON.stringify(userData));
    setUser(userData);
    setCart([]);
    toast.success('Welcome! ' + userData.name + ' 👋');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
    setTickets([]);
    toast('Logged out', { icon: '👋' });
  };

  const register = async (firstname, lastname, email, password, roleId) => {
    await api.post('/Auth/register', { firstname, lastname, email, password, roleId });
    toast.success('Registration successful 🎉');
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent    = (newEvent) => setEvents(prev => [newEvent, ...prev]);
  const updateEvent = (id, data) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/Events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
  };

  const approveEvent = async (id) => {
    try {
      await api.put(`/Events/${id}/status`, { isAccepted: true });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, isAccepted: true } : e));
      toast.success('Event approved!');
    } catch { toast.error('Failed to approve event'); }
  };

  const rejectEvent = async (id) => {
    try {
      await api.put(`/Events/${id}/status`, { isAccepted: false });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, isAccepted: false } : e));
      toast.error('Event rejected');
    } catch { toast.error('Action failed'); }
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const approveUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    toast.success('Organizer account approved!');
  };
  const rejectUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
    toast.error('Account rejected');
  };

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const toggleWatchlist = async (eventId) => {
    const inList = watchlist.includes(eventId);
    setWatchlist(prev => inList ? prev.filter(id => id !== eventId) : [...prev, eventId]);
    try {
      if (inList) {
        await api.delete(`/Users/DeleteFromFav/${eventId}`);
        toast('Removed from watchlist', { icon: '🗑️' });
      } else {
        await api.post(`/Users/AddEventToFavorites/${eventId}`);
        toast('Added to watchlist ❤️', { icon: '❤️' });
      }
    } catch {
      setWatchlist(prev => inList ? [...prev, eventId] : prev.filter(id => id !== eventId));
      toast.error('Failed to update watchlist');
    }
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = async (event, qty = 1) => {
    if (event.availableTickets < qty) {
      toast.error('Not enough tickets available');
      return;
    }
    try {
      await api.post(`/Users/Booking/${event.id}`);
      toast.success('Added to cart! 🛒');
      await fetchCart();
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/Events/GetCartEvents');
      const raw = Array.isArray(data) ? data : [data];
      setCart(raw.map(e => ({
        eventId:          e.id,
        title:            e.title,
        price:            e.ticketPrice,
        qty:              1,
        image:            e.image,
        date:             e.date?.slice(0, 10),
        venue:            e.location,
        availableTickets: e.availableTickets,
      })));
    } catch {
      toast.error('Failed to load cart');
    }
  };

  const updateCartQty = (eventId, newQty) => {
    if (newQty <= 0) { removeFromCart(eventId); return; }
    setCart(prev => prev.map(i => i.eventId === eventId ? { ...i, qty: newQty } : i));
  };

  const removeFromCart = async (eventId) => {
    try {
      await api.delete(`/Events/DeleteEventFromCart/${eventId}`);
      setCart(prev => prev.filter(i => i.eventId !== eventId));
      toast('Removed from cart', { icon: '🗑️' });
    } catch { toast.error('Failed to remove from cart'); }
  };

  const clearCart = async () => {
    try {
      await api.delete('/Events/ClearCart');
      setCart([]);
      toast('Cart cleared', { icon: '🗑️' });
    } catch { toast.error('Failed to clear cart'); }
  };

  const checkoutCart = async () => {
    if (cart.length === 0) return false;
    const payload = { items: cart.map(i => ({ eventId: i.eventId, numberOfTickets: i.qty })) };
    try {
      await api.post('/Tickets/ResrvationTicket', payload);
      await api.delete('/Events/ClearCart');
      setCart([]);
      toast.success('🎉 Tickets booked successfully!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
      return false;
    }
  };

  // ── Tickets ───────────────────────────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/Tickets/GetTickets');
      const raw = Array.isArray(data) ? data : [data];
      setTickets(raw.map(t => ({
        id:        t.id,
        eventId:   t.eventId,
        title:     t.title,
        location:  t.location,
        date:      t.date,
        dateLabel: t.date?.slice(0, 10),
        qrBytes:   t.qrBytes,
        rating:    t.rating,
      })));
    } catch {
      toast.error('Failed to load tickets');
    }
  };

  // ── Reviews ───────────────────────────────────────────────────────────────
  const addReview = (eventId, rating, text) => {
    const review = {
      id: Date.now(), eventId,
      userId: user.id, userName: user.name,
      rating, text,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews(prev => [review, ...prev]);
    toast.success('Review submitted!');
  };

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AppContext.Provider value={{
      user, login, logout, register,
      events, setEvents, addEvent, updateEvent, deleteEvent, approveEvent, rejectEvent,
      users, approveUser, rejectUser,
      watchlist, setWatchlist, fetchWatchlist, toggleWatchlist,
      cart, addToCart, fetchCart, updateCartQty, removeFromCart, clearCart, checkoutCart,
      tickets, fetchTickets,
      reviews, addReview,
      notifications, setNotifications, markAllRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);