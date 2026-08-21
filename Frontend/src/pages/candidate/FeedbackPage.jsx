import { useEffect, useState } from 'react';
import { getMyAllocations, submitFeedback } from '../../services/api2';
import { useAuth } from '../../context/AuthContext';

export default function FeedbackPage() {
  const { session } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await getMyAllocations();
        if (!mounted) return;
        setAllocations(resp.allocations || resp || []);
      } catch (err) {
        setError(err.message || 'Failed to load allocations');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [session?.token]);

  const handleRate = (internshipId, value) => {
    setForm((f) => ({ ...f, [internshipId]: { ...(f[internshipId] || {}), rating: value } }));
  };

  const handleComment = (internshipId, value) => {
    setForm((f) => ({ ...f, [internshipId]: { ...(f[internshipId] || {}), comment: value } }));
  };

  const handleSubmit = async (internshipId) => {
    const payload = form[internshipId] || {};
    if (!payload.rating) {
      alert('Please provide a rating (1-5)');
      return;
    }

    try {
      setSubmitting(true);
      await submitFeedback({ internshipId, rating: payload.rating, comment: payload.comment || '' });
      alert('Feedback submitted');
      // optionally refresh
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading eligible internships...</div>;
  if (error) return <div className="error">{error}</div>;

  const eligible = allocations.filter(a => a.status === 'ALLOCATED');

  return (
    <div>
      <h2>Provide Feedback</h2>
      {eligible.length === 0 && <p>No allocated internships available for feedback yet.</p>}
      <div className="cards-grid">
        {eligible.map((a) => (
          <div className="card" key={a._id}>
            <h3>{a.internship?.title}</h3>
            <p><strong>Organization:</strong> {a.internship?.organization}</p>
            <p><strong>Role:</strong> {a.internship?.role}</p>

            <div>
              <label>Rating</label>
              <div className="star-row">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" className={`star ${form[a._id]?.rating >= s ? 'active' : ''}`} onClick={() => handleRate(a._id, s)}>{s <= 2 ? '☆' : '☆'}</button>
                ))}
              </div>
            </div>

            <div>
              <label>Comment</label>
              <textarea value={form[a._id]?.comment || ''} onChange={(e) => handleComment(a._id, e.target.value)} />
            </div>

            <div>
              <button type="button" onClick={() => handleSubmit(a.internship?._id)} disabled={submitting}>Submit Feedback</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
