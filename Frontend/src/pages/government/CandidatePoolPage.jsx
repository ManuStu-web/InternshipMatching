import { useEffect, useState } from 'react';
import { getCandidates } from '../../services/api';

export default function GovernmentCandidatePoolPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchCandidates = async () => {
      try {
        const response = await getCandidates();
        if (!isMounted) return;
        setCandidates(response.candidates || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch candidate pool');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchCandidates();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> TALENT POOL</p>
          <h2>Registered Candidates</h2>
          <p className="page-subtitle">View and monitor the nationwide candidate pool.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {loading ? (
        <div className="panel loading-state">Loading candidate pool...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state panel">
          <h3>No Candidates</h3>
          <p>No candidates have registered on the platform yet.</p>
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Degree</th>
                <th style={{ padding: '1rem' }}>Experience</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}><strong>{candidate.name}</strong></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{candidate.email}</td>
                  <td style={{ padding: '1rem' }}>{candidate.education?.degree || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{candidate.experience ?? 0} yrs</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${candidate.resumeUrl ? 'success' : 'muted'}`}>
                      {candidate.resumeUrl ? 'Ready' : 'Incomplete'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
