import { useEffect, useState } from 'react';
import { getAllCandidates } from '../../services/api2';

export default function CandidatesPage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await getAllCandidates();
        setCandidates(resp.candidates || []);
      } catch (err) {
        setError(err.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = candidates.filter((c) => {
    if (!filterSkill) return true;
    return (c.skills || []).some((s) => s.toLowerCase().includes(filterSkill.toLowerCase()));
  });

  if (loading) return <div className="loading-state">Loading candidates...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-head">
          <h3>Candidates</h3>
          <div>
            <input placeholder="Filter by skill (e.g. React)" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} />
          </div>
        </div>

        <div style={{marginTop:12}}>
          {filtered.map((c) => (
            <div key={c._id} className="recommendation-item" style={{marginTop:8}}>
              <div>
                <strong>{c.name}</strong>
                <small style={{display:'block'}}>{c.email} • {c.phone}</small>
                <div style={{marginTop:6}}>
                  {(c.skills || []).map((s) => <span key={s} className="chip" style={{marginRight:6}}>{s}</span>)}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div>{c.experience} yrs</div>
                <div style={{marginTop:6}}>{c.eligibility ? 'Eligible' : 'Ineligible'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
