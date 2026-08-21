import { useEffect, useState } from 'react';
import { getCandidateAllocations, submitCandidateFeedback } from '../../services/api';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [feedbackInternshipId, setFeedbackInternshipId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchAllocations = async () => {
      try {
        const response = await getCandidateAllocations();
        if (!isMounted) return;
        setAllocations(response.allocations || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to fetch allocations');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchAllocations();
    return () => { isMounted = false; };
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('Submitting...');
    
    try {
      await submitCandidateFeedback({
        internshipId: feedbackInternshipId,
        feedback: feedbackText,
        rating: feedbackRating
      });
      setFeedbackStatus('Thank you! Your feedback has been received.');
      setTimeout(() => {
        if (isMounted) {
          setFeedbackInternshipId(null);
          setFeedbackText('');
          setFeedbackStatus('');
        }
      }, 3000);
    } catch (err) {
      setFeedbackStatus(err.message || 'Failed to submit feedback.');
    }
  };
  
  let isMounted = true;
  useEffect(() => {
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span /> YOUR ALLOCATIONS</p>
          <h2>Allocations & Status</h2>
          <p className="page-subtitle">Track your application matches and submit feedback for your allocations.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {loading ? (
        <div className="panel loading-state">Loading your allocations...</div>
      ) : allocations.length === 0 ? (
        <div className="empty-state panel">
          <h3>No allocations yet</h3>
          <p>You haven't been allocated to any internships. Make sure your profile is complete to improve your match score during the next allocation cycle.</p>
        </div>
      ) : (
        <div className="content-grid dashboard-grid">
          {allocations.map((alloc) => (
            <div key={alloc._id} className="panel">
              <div className="status-header" style={{ marginBottom: '1rem' }}>
                <h3>{alloc.internship?.title || 'Internship'}</h3>
                <span className={`status-badge ${alloc.status === 'ALLOCATED' ? 'success' : 'info'}`}>
                  {alloc.status}
                </span>
              </div>
              
              <ul className="mini-list compact-list" style={{ marginBottom: '1.5rem' }}>
                <li><strong>Organization:</strong> {alloc.internship?.organization || 'N/A'}</li>
                <li><strong>Location:</strong> {alloc.internship?.location || 'N/A'}</li>
                <li><strong>Role:</strong> {alloc.internship?.role || 'N/A'}</li>
                <li><strong>Match Score:</strong> {Number(alloc.score).toFixed(1)}%</li>
              </ul>
              
              {alloc.status === 'ALLOCATED' && feedbackInternshipId !== alloc.internship?._id && (
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={() => setFeedbackInternshipId(alloc.internship?._id)}
                >
                  Provide Feedback
                </button>
              )}

              {feedbackInternshipId === alloc.internship?._id && (
                <form onSubmit={handleFeedbackSubmit} className="feedback-form" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Experience Feedback</h4>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Help us improve the allocation process by sharing your experience.</p>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Rating (1-5)</label>
                    <select 
                      value={feedbackRating} 
                      onChange={(e) => setFeedbackRating(Number(e.target.value))}
                      className="form-control"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Comments</label>
                    <textarea 
                      value={feedbackText} 
                      onChange={(e) => setFeedbackText(e.target.value)} 
                      placeholder="Share your thoughts..."
                      required
                      className="form-control"
                      rows="3"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="submit" className="primary-button small-button">Submit</button>
                    <button type="button" className="secondary-button small-button" onClick={() => { setFeedbackInternshipId(null); setFeedbackStatus(''); }}>Cancel</button>
                  </div>
                  
                  {feedbackStatus && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: feedbackStatus.includes('Thank') ? 'var(--color-success)' : 'var(--text-muted)' }}>{feedbackStatus}</div>}
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
