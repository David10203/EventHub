// // src/pages/ProfilePage.jsx
// import { useState } from 'react';
// import { useApp } from '../context/AppContext';
// import { Avatar, PageHeader } from '../components/UI';
// import toast from 'react-hot-toast';

// const ProfilePage = () => {
//   const { user, tickets, events, watchlist } = useApp();
//   const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
//   const [saved, setSaved] = useState(false);

//   const myTickets  = tickets.filter(t => t.userId === user?.id);
//   const myWatched  = events.filter(e => watchlist.includes(e.id));
//   const myEvents   = events.filter(e => e.organizerId === user?.id);

//   const handleSave = () => {
//     setSaved(true);
//     toast.success('Profile updated!');
//     setTimeout(() => setSaved(false), 2000);
//   };

//   const stats = user?.role === 'participant'
//     ? [
//         { icon: '🎫', label: 'Tickets Booked', value: myTickets.length },
//         { icon: '❤️', label: 'Watchlist',      value: myWatched.length },
//         { icon: '⭐', label: 'Reviews Left',   value: 0                },
//       ]
//     : user?.role === 'organizer'
//     ? [
//         { icon: '🎭', label: 'Events Created', value: myEvents.length                        },
//         { icon: '✅', label: 'Approved',        value: myEvents.filter(e=>e.status==='approved').length },
//         { icon: '💰', label: 'Revenue',         value: `EGP ${myEvents.reduce((s,e)=>s+(e.totalTickets-e.availableTickets)*e.price,0).toLocaleString()}` },
//       ]
//     : [
//         { icon: '👥', label: 'Total Users',    value: 0 },
//         { icon: '🎭', label: 'Total Events',   value: events.length },
//         { icon: '🎫', label: 'Total Tickets',  value: tickets.length },
//       ];

//   return (
//     <div className="container py-4" style={{ maxWidth: 700 }}>
//       <PageHeader title="👤 My Profile"/>

//       {/* Profile card */}
//       <div className="eh-card p-4 mb-4">
//         <div className="d-flex align-items-center gap-4 mb-4 flex-wrap">
//           <Avatar name={user?.name} size={72}/>
//           <div>
//             <h5 className="fw-bold mb-0">{user?.name}</h5>
//             <p className="text-muted small mb-1">{user?.email}</p>
//             <span className={`badge text-capitalize ${
//               user?.role === 'admin' ? 'bg-danger' :
//               user?.role === 'organizer' ? 'bg-primary' : 'bg-secondary'
//             }`}>
//               {user?.role}
//             </span>
//             {user?.status === 'pending' && (
//               <span className="badge bg-warning text-dark ms-2">⏳ Pending Approval</span>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="row g-3 mb-4">
//           {stats.map(s => (
//             <div key={s.label} className="col-4">
//               <div className="text-center p-3 rounded-3" style={{ background: '#f8fafc' }}>
//                 <div style={{ fontSize: 22 }}>{s.icon}</div>
//                 <div className="fw-bold" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{s.value}</div>
//                 <div className="text-muted small">{s.label}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Edit form */}
//         <div className="border-top pt-4">
//           <h6 className="fw-bold mb-3">Edit Profile</h6>
//           <div className="row g-3">
//             <div className="col-md-6">
//               <label className="form-label small fw-semibold">Full Name</label>
//               <input className="form-control rounded-3" value={form.name}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/>
//             </div>
//             <div className="col-md-6">
//               <label className="form-label small fw-semibold">Email</label>
//               <input className="form-control rounded-3" type="email" value={form.email}
//                 onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/>
//             </div>
//             <div className="col-12">
//               <label className="form-label small fw-semibold">New Password</label>
//               <input className="form-control rounded-3" type="password" placeholder="Leave blank to keep current"/>
//             </div>
//           </div>
//           <button className={`btn mt-3 rounded-3 fw-semibold ${saved ? 'btn-success' : 'btn-brand'}`}
//             onClick={handleSave}>
//             {saved ? <><i className="bi bi-check me-1"/>Saved!</> : 'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
