// // src/pages/organizer/AnalyticsPage.jsx
// import { useApp } from '../../context/AppContext';
// import { PageHeader } from '../../components/UI';

// const AnalyticsPage = () => {
//   const { user, events } = useApp();
//   const myEvents = events.filter(e => e.organizerId === user?.id);

//   const totalSold    = myEvents.reduce((s, e) => s + (e.totalTickets - e.availableTickets), 0);
//   const totalRevenue = myEvents.reduce((s, e) => s + (e.totalTickets - e.availableTickets) * e.price, 0);
//   const totalCap     = myEvents.reduce((s, e) => s + e.totalTickets, 0);
//   const avgOccupancy = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0;

//   const byCat = CATEGORIES_USED(myEvents);

//   return (
//     <div className="container py-4">
//       <PageHeader title="📊 Analytics" subtitle="Overview of your events performance"/>

//       {/* KPI cards */}
//       <div className="row g-3 mb-4">
//         {[
//           { icon: '🎫', label: 'Tickets Sold',   value: totalSold,                      color: '#4f46e5' },
//           { icon: '💰', label: 'Total Revenue',  value: `EGP ${totalRevenue.toLocaleString()}`, color: '#10b981' },
//           { icon: '📈', label: 'Avg Occupancy',  value: `${avgOccupancy}%`,              color: '#f59e0b' },
//           { icon: '🎭', label: 'Active Events',  value: myEvents.filter(e=>e.status==='approved').length, color: '#ec4899' },
//         ].map(s => (
//           <div key={s.label} className="col-6 col-md-3">
//             <div className="eh-card p-3 text-center">
//               <div style={{ fontSize: 28 }}>{s.icon}</div>
//               <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, marginTop: 4 }}>{s.value}</div>
//               <div className="text-muted small">{s.label}</div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Ticket sales breakdown */}
//       <div className="eh-card p-4 mb-4">
//         <h6 className="fw-bold mb-4">Ticket Sales by Event</h6>
//         {myEvents.length === 0 && <p className="text-muted text-center py-3">No events yet</p>}
//         {myEvents.map(event => {
//           const sold = event.totalTickets - event.availableTickets;
//           const pct  = Math.round((sold / event.totalTickets) * 100);
//           return (
//             <div key={event.id} className="mb-4">
//               <div className="d-flex justify-content-between mb-1">
//                 <span className="small fw-semibold">{event.title}</span>
//                 <span className="small text-muted">
//                   {sold} / {event.totalTickets} sold · EGP {(sold * event.price).toLocaleString()}
//                 </span>
//               </div>
//               <div className="progress ticket-bar" style={{ height: 10, borderRadius: 6 }}>
//                 <div className="progress-bar" style={{ width: `${pct}%`, borderRadius: 6 }}>
//                   <span style={{ fontSize: '.65rem', paddingLeft: 4 }}>{pct}%</span>
//                 </div>
//               </div>
//               <div className="d-flex justify-content-between mt-1">
//                 <span className="text-muted" style={{ fontSize: '.7rem' }}>
//                   {event.availableTickets} remaining
//                 </span>
//                 <span className="text-muted" style={{ fontSize: '.7rem' }}>
//                   Revenue: EGP {(sold * event.price).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* By category */}
//       {byCat.length > 0 && (
//         <div className="eh-card p-4">
//           <h6 className="fw-bold mb-4">Events by Category</h6>
//           <div className="row g-2">
//             {byCat.map(({ cat, count }) => (
//               <div key={cat} className="col-auto">
//                 <div className="px-3 py-2 rounded-3 text-center"
//                   style={{ background: '#f1f5f9', minWidth: 80 }}>
//                   <div className="fw-bold" style={{ color: 'var(--primary)' }}>{count}</div>
//                   <div className="text-muted small">{cat}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CATEGORIES_USED = (events) => {
//   const map = {};
//   events.forEach(e => { map[e.category] = (map[e.category] || 0) + 1; });
//   return Object.entries(map).map(([cat, count]) => ({ cat, count }));
// };

// export default AnalyticsPage;
