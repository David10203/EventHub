// src/pages/organizer/CreateEventPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI';
import api from '../../api/api';
import toast from 'react-hot-toast';

const CreateEventPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useApp();
  const imageInputRef = useRef();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver]     = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', location: '',
    date: '', time: '', price: '', totalTickets: '',
    image: '', categoryId: '',
  });
  const [errors, setErrors] = useState({});

  /* ── load ── */
  useEffect(() => {
    api.get('/Category')
      .then(res => setCategories(res.data))
      .catch(() => toast.error('Failed to load categories'));

    if (isEdit) {
      api.get(`/Events/${id}`)
        .then(res => {
          const e = res.data;
          setForm({
            title:        e.title           ?? '',
            description:  e.description     ?? '',
            location:     e.location        ?? '',
            date:         e.date?.slice(0, 10) ?? '',
            time:         e.date?.slice(11, 16) ?? '',
            price:        e.ticketPrice     ?? '',
            totalTickets: e.numberOfTickets ?? '',
            image:        e.image           ?? '',
            categoryId:   e.categoryId      ?? '',
          });
          if (e.image) setImagePreview(e.image.startsWith('http') || e.image.startsWith('data:') ? e.image : `data:image/png;base64,${e.image}`);
          if (e.attachmentFileName) setExistingFile(e.attachmentFileName);
        })
        .catch(() => toast.error('Failed to load event data'));
    } else {
      setForm({ title:'',description:'',location:'',date:'',time:'',price:'',totalTickets:'',image:'',categoryId:'' });
      setAttachment(null); setExistingFile(null);
      setImageFile(null); setImagePreview(''); setErrors({});
    }
  }, [id, isEdit]);

  /* ── download attachment ── */
  const downloadFile = async () => {
    try {
      const res = await api.get(`/Events/${id}/attachment`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', existingFile ? existingFile.split('/').pop() : 'attachment.pdf');
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Could not download file'); }
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  /* ── image helper ── */
  const applyImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    set('image', '');
  };

  /* ── validate ── */
  const validate = () => {
    const e = {};
    if (!form.title)        e.title        = 'Title is required';
    if (!form.description)  e.description  = 'Description is required';
    if (!form.location)     e.location     = 'Location is required';
    if (!form.date)         e.date         = 'Date is required';
    if (!form.time)         e.time         = 'Time is required';
    if (form.price === '')  e.price        = 'Price is required (0 for free)';
    if (form.price !== '' && (isNaN(Number(form.price)) || Number(form.price) < 0 || !Number.isInteger(Number(form.price))))
      e.price = 'Price must be a whole number ≥ 0';
    if (!form.totalTickets) e.totalTickets = 'Total tickets is required';
    if (form.totalTickets && (!Number.isInteger(Number(form.totalTickets)) || Number(form.totalTickets) < 1))
      e.totalTickets = 'Tickets must be a whole number ≥ 1';
    if (!form.categoryId)   e.categoryId   = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const datetime = `${form.date} ${form.time}:00.0000000`;

      const params = new URLSearchParams({
        title:           form.title,
        Description:     form.description,
        Location:        form.location,
        TicketPrice:     String(Math.round(Number(form.price))),
        NumberOfTickets: String(Math.round(Number(form.totalTickets))),
        CategoryId:      form.categoryId,
        Date:            datetime,
      });

      const formData = new FormData();
      if (imageFile)  formData.append('Image',      imageFile);
      if (attachment) formData.append('Attachment', attachment);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await api.put(`/Events/${id}?${params}`, formData, config);
        toast.success('Event updated successfully!');
      } else {
        await api.post(`/Events?${params}`, formData, config);
        toast.success('Event submitted for approval!');
      }
      navigate('/my-events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── render ── */
  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <PageHeader
        title={isEdit ? '✏️ Edit Event' : '🎭 Create New Event'}
        subtitle={isEdit
          ? 'Update your event details below'
          : 'Fill in the details below — your event will be reviewed by an admin before going live'}
      />

      <div className="eh-card p-4">

        {/* ── Basic Info ── */}
        <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ letterSpacing: '.06em' }}>
          Basic Info
        </p>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Event Title *</label>
          <input
            className={`form-control rounded-3 ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Cairo Jazz Night 2026"
            value={form.title} onChange={e => set('title', e.target.value)}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Location *</label>
            <input
              className={`form-control rounded-3 ${errors.location ? 'is-invalid' : ''}`}
              placeholder="Venue or city"
              value={form.location} onChange={e => set('location', e.target.value)}
            />
            {errors.location && <div className="invalid-feedback">{errors.location}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Category *</label>
            <select
              className={`form-select rounded-3 ${errors.categoryId ? 'is-invalid' : ''}`}
              value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
            >
              <option value="">Select category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Description *</label>
          <textarea
            className={`form-control rounded-3 ${errors.description ? 'is-invalid' : ''}`}
            rows={4} placeholder="What is this event about?"
            value={form.description} onChange={e => set('description', e.target.value)}
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>

        {/* ── Date & Tickets ── */}
        <hr className="my-4"/>
        <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ letterSpacing: '.06em' }}>
          Date &amp; Tickets
        </p>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Date *</label>
            <input
              type="date"
              className={`form-control rounded-3 ${errors.date ? 'is-invalid' : ''}`}
              value={form.date} onChange={e => set('date', e.target.value)}
            />
            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Time *</label>
            <input
              type="time"
              className={`form-control rounded-3 ${errors.time ? 'is-invalid' : ''}`}
              value={form.time} onChange={e => set('time', e.target.value)}
            />
            {errors.time && <div className="invalid-feedback">{errors.time}</div>}
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Ticket Price * <span className="text-muted fw-normal">(0 for free)</span></label>
            <div className="input-group">
              <span className="input-group-text rounded-start-3">EGP</span>
              <input
                type="number" min="0" step="1"
                className={`form-control rounded-end-3 ${errors.price ? 'is-invalid' : ''}`}
                placeholder="0"
                value={form.price} onChange={e => set('price', e.target.value)}
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Total Tickets *</label>
            <input
              type="number" min="1" step="1"
              className={`form-control rounded-3 ${errors.totalTickets ? 'is-invalid' : ''}`}
              placeholder="e.g. 200"
              value={form.totalTickets} onChange={e => set('totalTickets', e.target.value)}
            />
            {errors.totalTickets && <div className="invalid-feedback">{errors.totalTickets}</div>}
          </div>
        </div>

        {/* ── Media ── */}
        <hr className="my-4"/>
        <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ letterSpacing: '.06em' }}>
          Media &amp; Files
        </p>

        {/* Image upload */}
        <div className="mb-3">
          <label className="form-label fw-semibold small">Event Image</label>

          {/* Drop zone */}
          <div
            onClick={() => imageInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); applyImageFile(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary)' : '#dee2e6'}`,
              borderRadius: 12,
              cursor: 'pointer',
              overflow: 'hidden',
              background: dragOver ? 'rgba(79,70,229,.04)' : '#f8f9fa',
              transition: 'border-color .15s, background .15s',
              position: 'relative',
            }}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview} alt="preview"
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                />
                {/* hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <span className="text-white fw-semibold small">
                    <i className="bi bi-camera me-1"/>Change Image
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-cloud-upload" style={{ fontSize: 32, color: 'var(--primary)' }}/>
                <p className="fw-semibold mb-0 mt-2" style={{ color: 'var(--primary)', fontSize: '.9rem' }}>
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-muted small mb-0">PNG, JPG, WEBP</p>
              </div>
            )}
          </div>

          <input
            ref={imageInputRef}
            type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { applyImageFile(e.target.files[0]); e.target.value = ''; }}
          />

          {imagePreview && (
            <button
              className="btn btn-sm btn-outline-danger rounded-3 mt-2"
              onClick={() => { setImageFile(null); setImagePreview(''); set('image', ''); }}
            >
              <i className="bi bi-trash me-1"/>Remove Image
            </button>
          )}
        </div>

        {/* Attachment */}
        <div className="mb-4">
          <label className="form-label fw-semibold small">
            Attachment <span className="text-muted fw-normal">(PDF, schedule, etc.)</span>
          </label>

          {isEdit && existingFile && !attachment && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-2 mb-2 w-100"
              onClick={downloadFile}
            >
              <i className="bi bi-file-earmark-pdf"/>
              <span className="flex-fill text-start">{existingFile.split('/').pop()}</span>
              <span className="text-muted small">Current file ↓</span>
            </button>
          )}

          <input
            type="file" accept=".pdf,.doc,.docx"
            className="form-control rounded-3"
            onChange={e => setAttachment(e.target.files[0] || null)}
          />

          {attachment && (
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="badge bg-light text-dark border rounded-3 py-2 px-3">
                <i className="bi bi-file-earmark me-1"/>{attachment.name}
              </span>
              <button className="btn btn-sm btn-outline-danger rounded-3" onClick={() => setAttachment(null)}>
                <i className="bi bi-x"/>
              </button>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary rounded-3 flex-fill" onClick={() => navigate('/my-events')}>
            Cancel
          </button>
          <button className="btn btn-brand rounded-3 flex-fill fw-semibold" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"/>Processing…</>
              : <><i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-send'} me-2`}/>{isEdit ? 'Save Changes' : 'Submit for Approval'}</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateEventPage;