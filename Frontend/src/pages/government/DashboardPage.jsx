import { useEffect, useState } from 'react';
import { getInternships, getCandidates } from '../../services/api';

export default function GovernmentDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalCandidates: 0,
    totalAllocated: 0 // Placeholder, as we don't have a direct global endpoint for this without iterating, but we can fake it or calculate it
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [internshipsData, candidatesData] = await Promise.all([
          getInternships(),
          getCandidates()
        ]);
        
        if (!isMounted) return;
        
        setStats({
          totalInternships: internshipsData.count || 0,
          totalCandidates: candidatesData.count || 0,
          totalAllocated: 0 // We'll leave this as 0 for now unless we iterate all allocations
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> OVERVIEW</p>
          <h2>Government Dashboard</h2>
          <p className="page-subtitle">Monitor internship programs and candidate pools.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {loading ? (
        <div className="panel loading-state">Loading metrics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="panel stat-panel">
              <div className="status-header">
                <p>Total Internships</p>
                <span className="status-badge info">Active</span>
              </div>
              <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{stats.totalInternships}</h2>
              <button type="button" className="secondary-button small-button" onClick={() => onNavigate('/government/internships')}>
                Manage Internships
              </button>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Total Candidates</p>
                <span className="status-badge success">Registered</span>
              </div>
              <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{stats.totalCandidates}</h2>
              <button type="button" className="secondary-button small-button" onClick={() => onNavigate('/government/candidates')}>
                View Candidate Pool
              </button>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Allocations</p>
                <span className="status-badge primary">Matching</span>
              </div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                Run the AI matching engine to automatically allocate candidates to the best-fit internships based on skill score, eligibility, and preference.
              </p>
              <button type="button" className="primary-button small-button" style={{ marginTop: '1.5rem' }} onClick={() => onNavigate('/government/allocations')}>
                Run Allocations
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
