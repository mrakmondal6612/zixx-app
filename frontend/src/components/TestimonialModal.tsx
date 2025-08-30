import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onSubmit: (payload: { rating: number; text: string; name?: string }) => Promise<void> | void;
  onSkip: () => void;
  userName?: string;
};

const TestimonialModal: React.FC<Props> = ({ open, onSubmit, onSkip, userName }) => {
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState<string>("");
  const [name, setName] = useState<string>(userName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Create a container for portal to avoid z-index/stacking issues
  const container = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.setAttribute('data-testid', 'testimonial-modal-root');
    return el;
  }, []);

  useEffect(() => {
    if (!container || typeof document === 'undefined') return;
    document.body.appendChild(container);
    return () => {
      try { document.body.removeChild(container); } catch {}
    };
  }, [container]);

  useEffect(() => { setName(userName || ""); }, [userName]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onSkip]);
  if (!open || !container) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!text.trim()) {
      setError('Please write a short feedback.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ rating, text, name });
    } catch (e: any) {
      setError(e?.message || 'Failed to submit testimonial');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="testimonial-title"
      style={{ position: 'fixed', inset: 0, zIndex: 2147483647, display: 'grid', placeItems: 'center' }}
    >
      <div onClick={onSkip} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'relative', background: 'white', width: 520, maxWidth: '94%', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
        <h3 id="testimonial-title" style={{ marginTop: 0, marginBottom: 8 }}>Share your experience</h3>
        <p style={{ marginTop: 0, color: '#6b7280' }}>Before you logout, could you leave us a quick testimonial? It helps us improve.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>Your Name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>Feedback</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you like? What could be better?" rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, resize: 'vertical' }} />
          </div>
          {error ? <div style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onSkip} disabled={loading}
              style={{ padding: '10px 14px', background: '#e5e7eb', border: 'none', borderRadius: 8 }}>Skip</button>
            <button type="submit" disabled={loading}
              style={{ padding: '10px 14px', background: '#111827', color: 'white', border: 'none', borderRadius: 8 }}>{loading ? 'Submitting...' : 'Submit & Logout'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, container);
};

export default TestimonialModal;
