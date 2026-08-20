import { useEffect, useState } from 'react';
import { getAnalyticsOverview } from '../../services/api2';

export default function GovAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await getAnalyticsOverview();
        if (!mounted) return;
        setStats(resp);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Analytics Overview</h2>
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
          <span>Total allocations</span>
          <strong>{stats.totalAllocations}</strong>
        </div>
        <div className="metric-tile">
          <span>Allocated candidates</span>
          <strong>{stats.allocatedCandidates}</strong>
        </div>
        <div className="metric-tile">
          <span>Unallocated candidates</span>
          <strong>{stats.unallocatedCandidates}</strong>
        </div>
        <div className="metric-tile">
          <span>Feedback responses</span>
          <strong>{stats.feedbackCount}</strong>
        </div>
        <div className="metric-tile">
          <span>Average rating</span>
          <strong>{Number(stats.averageRating).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
