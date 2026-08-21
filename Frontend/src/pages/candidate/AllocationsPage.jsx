import { useEffect, useMemo, useRef, useState } from 'react';
import { getCandidateAllocations, submitCandidateFeedback } from '../../services/api';

const BREAKDOWN_FIELDS = [
  { key: 'skills', label: 'Skills', weight: '40%' },
  { key: 'eligibility', label: 'Eligibility', weight: '20%' },
  { key: 'role', label: 'Role fit', weight: '15%' },
  { key: 'location', label: 'Location', weight: '10%' },
  { key: 'sector', label: 'Sector', weight: '10%' },
  { key: 'experience', label: 'Experience', weight: '5%' },
];

function ScoreRing({ score, tone }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div
      className="allocation-score-ring"
      style={{ '--ring-pct': pct, '--ring-color': tone }}
      aria-label={`Match score ${pct.toFixed(0)}%`}
    >
      <span>{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [feedbackInternshipId, setFeedbackInternshipId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const [expandedBreakdownId, setExpandedBreakdownId] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await getCandidateAllocations();
        if (!isMountedRef.current) return;
        setAllocations(response.allocations || []);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err.message || 'Unable to fetch allocations');
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  const stats = useMemo(() => {
    const total = allocations.length;
    const allocated = allocations.filter((a) => a.status === 'ALLOCATED').length;
    const waitlisted = total - allocated;
    const avgScore = total
      ? allocations.reduce((sum, a) => sum + Number(a.score || 0), 0) / total
      : 0;
    return { total, allocated, waitlisted, avgScore };
  }, [allocations]);

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
        if (!isMountedRef.current) return;
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
          <p className="eyebrow dark"><span /> YOUR ALLOCATIONS</p>
          <h2>Allocations & Status</h2>
          <p className="page-subtitle">Track your application matches and submit feedback for your allocations.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {!loading && allocations.length > 0 && (
        <div className="allocation-overview">
          <div className="panel allocation-overview-tile">
            <span>Total Matches</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="panel allocation-overview-tile success">
            <span>Allocated</span>
            <strong>{stats.allocated}</strong>
          </div>
          <div className="panel allocation-overview-tile">
            <span>Waitlisted</span>
            <strong>{stats.waitlisted}</strong>
          </div>
          <div className="panel allocation-overview-tile accent">
            <span>Avg. Match Score</span>
            <strong>{stats.avgScore.toFixed(1)}%</strong>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel loading-state">Loading your allocations...</div>
      ) : allocations.length === 0 ? (
        <div className="empty-state panel">
          <h3>No allocations yet</h3>
          <p>You haven't been allocated to any internships. Make sure your profile is complete to improve your match score during the next allocation cycle.</p>
        </div>
      ) : (
        <div className="allocation-grid">
          {allocations.map((alloc) => {
            const isAllocated = alloc.status === 'ALLOCATED';
            const tone = isAllocated ? 'var(--success)' : 'var(--warning)';
            const breakdownOpen = expandedBreakdownId === alloc._id;

            return (
              <div
                key={alloc._id}
                className={`panel allocation-card ${isAllocated ? 'is-allocated' : 'is-waitlist'}`}
              >
                <div className="allocation-top">
                  <div className="allocation-title-group">
                    <h3>{alloc.internship?.title || 'Internship'}</h3>
                    <p className="allocation-org">{alloc.internship?.organization || 'Organization'}</p>
                    <span className={`status-badge ${isAllocated ? 'success' : 'warning'}`}>
                      {isAllocated ? '✓ Allocated' : '⏳ Waitlisted'}
                    </span>
                  </div>
                  <ScoreRing score={alloc.score} tone={tone} />
                </div>

                <div className="allocation-meta-row">
                  <div className="allocation-meta-item">
                    <span className="allocation-meta-icon">📍</span>
                    <div>
                      <span>Location</span>
                      <strong>{alloc.internship?.location || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="allocation-meta-item">
                    <span className="allocation-meta-icon">💼</span>
                    <div>
                      <span>Role</span>
                      <strong>{alloc.internship?.role || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="allocation-breakdown-toggle"
                  onClick={() => setExpandedBreakdownId(breakdownOpen ? null : alloc._id)}
                >
                  {breakdownOpen ? '▾ Hide match breakdown' : '▸ View match breakdown'}
                </button>

                {breakdownOpen && (
                  <div className="allocation-breakdown">
                    {BREAKDOWN_FIELDS.map((field) => {
                      const value = Number(alloc.breakdown?.[field.key] || 0);
                      return (
                        <div key={field.key} className="allocation-breakdown-row">
                          <span>
                            {field.label} <small style={{ opacity: 0.65 }}>({field.weight})</small>
                          </span>
                          <div className="allocation-breakdown-bar">
                            <span style={{ width: `${Math.min(100, value)}%` }} />
                          </div>
                          <span>{value.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="allocation-card-actions">
                  {isAllocated && feedbackInternshipId !== alloc.internship?._id && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setFeedbackInternshipId(alloc.internship?._id)}
                    >
                      Provide Feedback
                    </button>
                  )}
                </div>

                {feedbackInternshipId === alloc.internship?._id && (
                  <form onSubmit={handleFeedbackSubmit} className="feedback-panel">
                    <div>
                      <h4>Experience Feedback</h4>
                      <p>Help us improve the allocation process by sharing your experience.</p>
                    </div>

                    <div className="form-group">
                      <label>Rating</label>
                      <div className="rating-row">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`rating-star ${value <= feedbackRating ? 'active' : ''}`}
                            onClick={() => setFeedbackRating(value)}
                            aria-label={`${value} star${value > 1 ? 's' : ''}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
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
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => {
                          setFeedbackInternshipId(null);
                          setFeedbackStatus('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {feedbackStatus && (
                      <div className={`feedback-status ${feedbackStatus.includes('Thank') ? 'is-success' : 'is-pending'}`}>
                        {feedbackStatus}
                      </div>
                    )}
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