import { useEffect, useState } from 'react';
import { getInternships, getCandidates, getAllocationMetrics } from '../../services/api';

export default function GovernmentDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalCandidates: 0,
    totalAllocated: 0,
    totalSeats: 0,
    fillRate: 0,
    aspirationalPercentage: 0,
    ruralPercentage: 0,
    femalePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [internshipsData, candidatesData, metricsData] = await Promise.all([
          getInternships(),
          getCandidates(),
          getAllocationMetrics().catch(() => null),
        ]);
        
        if (!isMounted) return;
        
        const m = metricsData?.metrics || {};
        setStats({
          totalInternships: internshipsData.count || internshipsData.internship?.length || 0,
          totalCandidates: candidatesData.count || candidatesData.candidates?.length || 0,
          totalAllocated: m.totalAllocated || 0,
          totalSeats: m.totalSeats || 0,
          fillRate: m.fillRate || 0,
          aspirationalPercentage: m.aspirationalPercentage || 0,
          ruralPercentage: m.ruralPercentage || 0,
          femalePercentage: m.femalePercentage || 0,
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
          <p className="eyebrow dark">
            <span style={{ background: 'var(--primary)' }} /> SCHEME OVERVIEW
          </p>
          <h2>MoCA PM Internship Command Center</h2>
          <p className="page-subtitle">
            National overview of student applicants, enterprise opportunities, and AI-assisted affirmative allocations.
          </p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {loading ? (
        <div className="panel loading-state">Loading scheme metrics…</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="panel stat-panel">
              <div className="status-header">
                <p>Available Programs</p>
                <span className="status-badge info">Active</span>
              </div>
              <h2 style={{ fontSize: '2.8rem', margin: '0.8rem 0' }}>{stats.totalInternships}</h2>
              <button
                type="button"
                className="secondary-button small-button"
                onClick={() => onNavigate('/government/internships')}
              >
                Manage Opportunities
              </button>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Candidate Pool</p>
                <span className="status-badge success">Verified</span>
              </div>
              <h2 style={{ fontSize: '2.8rem', margin: '0.8rem 0' }}>{stats.totalCandidates}</h2>
              <button
                type="button"
                className="secondary-button small-button"
                onClick={() => onNavigate('/government/candidates')}
              >
                View Candidate Directory
              </button>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Allocated Seats</p>
                <span className="status-badge primary">Smart Matching</span>
              </div>
              <h2 style={{ fontSize: '2.8rem', margin: '0.8rem 0', color: 'var(--primary)' }}>
                {stats.totalAllocated}
              </h2>
              <button
                type="button"
                className="primary-button small-button"
                onClick={() => onNavigate('/government/allocations')}
              >
                ⚡ Policy Simulator & Allocations
              </button>
            </div>
          </div>

          {/* Affirmative Action Inclusivity Summary Card */}
          <div className="panel" style={{ marginTop: '0.5rem' }}>
            <div className="section-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <h3>Affirmative Action & Social Inclusivity Index</h3>
                <p className="page-subtitle" style={{ margin: 0, fontSize: '0.85rem' }}>
                  Real-time representation indicators compliant with Ministry of Corporate Affairs guidelines.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Aspirational Districts
                </p>
                <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{stats.aspirationalPercentage}%</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Targeted under NITI Aayog initiative
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rural Inclusion
                </p>
                <strong style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>{stats.ruralPercentage}%</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Candidates from rural panchayats
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Women in Internships
                </p>
                <strong style={{ fontSize: '1.8rem', color: 'var(--success)' }}>{stats.femalePercentage}%</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Female student representation
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
