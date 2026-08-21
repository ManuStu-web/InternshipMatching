import { useEffect, useState } from 'react';
import { getCandidateAllocations, updateAllocationAcceptance, submitCandidateFeedback } from '../../services/api';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [feedbackInternshipId, setFeedbackInternshipId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const fetchAllocations = async () => {
    try {
      const response = await getCandidateAllocations();
      setAllocations(response.allocations || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleOfferResponse = async (allocationId, status) => {
    setError('');
    setSuccessMessage('');
    try {
      await updateAllocationAcceptance(allocationId, status);
      setSuccessMessage(`Offer status updated: ${status}`);
      await fetchAllocations();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update offer response');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('Submitting...');
    
    try {
      await submitCandidateFeedback({
        internshipId: feedbackInternshipId,
        feedback: feedbackText,
        rating: feedbackRating,
      });
      setFeedbackStatus('Thank you! Your feedback has been received.');
      setTimeout(() => {
        setFeedbackInternshipId(null);
        setFeedbackText('');
        setFeedbackStatus('');
      }, 3000);
    } catch (err) {
      setFeedbackStatus(err.message || 'Failed to submit feedback.');
    }
  };

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span /> PM INTERNSHIP STATUS</p>
          <h2>Your Placement Status & Offers</h2>
          <p className="page-subtitle">Track your AI-allocated internship opportunities, review match rationale, and confirm your seat.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {successMessage && <div className="notice-box success-box">{successMessage}</div>}

      {loading ? (
        <div className="panel loading-state">Checking your allocation records…</div>
      ) : allocations.length === 0 ? (
        <div className="empty-state panel">
          <h3>No Allocations Yet</h3>
          <p>You haven't been allocated to an internship yet. Ensure your profile is updated and rank your top 3 preferred internships in the explore section.</p>
        </div>
      ) : (
        <div className="content-grid dashboard-grid">
          {allocations.map((alloc) => {
            const isAllocated = alloc.status === 'ALLOCATED';
            const acceptance = alloc.acceptanceStatus || 'PENDING';

            return (
              <div
                key={alloc._id}
                className="panel"
                style={{
                  border: isAllocated ? '1px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                <div className="status-header" style={{ marginBottom: '1rem' }}>
                  <div>
                    <h3>{alloc.internship?.title || 'Internship'}</h3>
                    <p className="company-name" style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>
                      {alloc.internship?.organization || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`status-badge ${isAllocated ? 'success' : 'info'}`}>
                      {alloc.status}
                    </span>
                    {isAllocated && (
                      <span
                        className="chip"
                        style={{
                          fontSize: '0.72rem',
                          background: acceptance === 'ACCEPTED' ? 'rgba(20, 125, 104, 0.2)' : acceptance === 'DECLINED' ? 'rgba(182, 70, 61, 0.2)' : 'rgba(243, 108, 60, 0.15)',
                          color: acceptance === 'ACCEPTED' ? 'var(--success)' : acceptance === 'DECLINED' ? 'var(--danger)' : 'var(--accent)',
                        }}
                      >
                        {acceptance === 'ACCEPTED' ? '✓ Accepted' : acceptance === 'DECLINED' ? '✗ Declined' : 'Action Required'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Explainable AI Match Badge */}
                <div style={{ padding: '0.8rem', background: 'var(--surface-secondary)', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Match Fit</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{Number(alloc.score).toFixed(1)}%</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Allocation Rationale:</strong> {alloc.reasonSummary || 'Direct Merit & Eligibility Match'}
                  </p>
                </div>
                
                <ul className="mini-list compact-list" style={{ marginBottom: '1.5rem' }}>
                  <li><strong>Location:</strong> {alloc.internship?.location || 'N/A'}</li>
                  <li><strong>Sector:</strong> {alloc.internship?.sector || 'N/A'}</li>
                  <li><strong>Role:</strong> {alloc.internship?.role || 'N/A'}</li>
                </ul>

                {/* Offer Acceptance Actions */}
                {isAllocated && acceptance === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ flex: 1 }}
                      onClick={() => handleOfferResponse(alloc._id, 'ACCEPTED')}
                    >
                      ✓ Accept Placement
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => handleOfferResponse(alloc._id, 'DECLINED')}
                    >
                      Decline Offer
                    </button>
                  </div>
                )}
                
                {isAllocated && feedbackInternshipId !== alloc.internship?._id && (
                  <button 
                    type="button" 
                    className="secondary-button" 
                    onClick={() => setFeedbackInternshipId(alloc.internship?._id)}
                  >
                    Provide Experience Feedback
                  </button>
                )}

                {feedbackInternshipId === alloc.internship?._id && (
                  <form onSubmit={handleFeedbackSubmit} className="feedback-form" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Experience Feedback</h4>
                    <p style={{ fontSize: '0.82rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                      Share your experience to help the Ministry improve future placement rounds.
                    </p>
                    
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
                        <option value="1">1 - Needs Improvement</option>
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
                      <button type="submit" className="primary-button small-button">Submit Feedback</button>
                      <button type="button" className="secondary-button small-button" onClick={() => { setFeedbackInternshipId(null); setFeedbackStatus(''); }}>Cancel</button>
                    </div>
                    
                    {feedbackStatus && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: feedbackStatus.includes('Thank') ? 'var(--success)' : 'var(--text-muted)' }}>{feedbackStatus}</div>}
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
