import { useEffect, useState } from 'react';
import { getInternships, getAllCandidates } from '../../services/api2';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const internshipsResp = await getInternships();
        const candidatesResp = await getAllCandidates();

        const internships = internshipsResp?.internship || [];
        const candidates = candidatesResp?.candidates || [];

        const eligible = candidates.filter((c) => c.eligibility === true).length;
        const availableInternships = internships.filter((i) => i.status !== 'closed').length;

        setStats({
          totalCandidates: candidates.length,
          totalInternships: internships.length,
          candidatesEligible: eligible,
          internshipsAvailable: availableInternships,
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow dark"><span /> GOVERNMENT DASHBOARD</span>
            <h2>Overview</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-tile">
            <span>Total candidates</span>
            <strong>{stats.totalCandidates}</strong>
          </div>
          <div className="metric-tile">
            <span>Total internships</span>
            <strong>{stats.totalInternships}</strong>
          </div>
          <div className="metric-tile">
            <span>Candidates eligible</span>
            <strong>{stats.candidatesEligible}</strong>
          </div>
        </div>

        <p className="dashboard-note">Use the navigation to manage internships, review candidates, and run allocations.</p>
      </div>
    </div>
  );
}
