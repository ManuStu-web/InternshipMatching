import { useEffect, useState } from 'react';
import { getAllFeedback, getFeedbackForInternship } from '../../services/api2';

export default function GovFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await getAllFeedback();
        if (!mounted) return;
        setFeedbacks(resp.feedbacks || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch feedback');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const loadForInternship = async (id) => {
    try {
      const resp = await getFeedbackForInternship(id);
      setStats(resp);
    } catch (err) {
      setError(err.message || 'Failed to fetch internship feedback');
    }
  };

  return (
    <div>
      <h2>Feedback</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="two-column">
        <div>
          <h3>Recent Feedback</h3>
          {feedbacks.length === 0 && <p>No feedback yet.</p>}
          <ul className="feedback-list">
            {feedbacks.slice(0,50).map((f) => (
              <li key={f._id}>
                <strong>{f.internship?.title}</strong> — {f.rating}⭐
                <div className="muted">{f.comment}</div>
                <div className="muted">By: {f.candidate?.name}</div>
                <button onClick={() => loadForInternship(f.internship._id)}>View internship stats</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Internship Stats</h3>
          {stats ? (
            <div>
              <p>Responses: {stats.count}</p>
              <p>Average Rating: {Number(stats.averageRating).toFixed(2)}</p>
              <pre>{JSON.stringify(stats.distribution,null,2)}</pre>
            </div>
          ) : (
            <p>Select a feedback item to view internship stats.</p>
          )}
        </div>
      </div>
    </div>
  );
}
