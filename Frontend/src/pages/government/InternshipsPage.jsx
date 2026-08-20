import { useEffect, useState } from 'react';
import { getInternships, runAllocation, getAllocationResults } from '../../services/api2';

export default function InternshipsPage() {
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [allocResult, setAllocResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await getInternships();
        setInternships(resp?.internship || []);
      } catch (err) {
        setError(err.message || 'Failed to load internships');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const onSelect = async (internship) => {
    setSelected(internship);
    setAllocResult(null);
    try {
      const res = await getAllocationResults(internship._id);
      setAllocResult(res.allocations || null);
    } catch (err) {
      // no allocations yet
      setAllocResult(null);
    }
  };

  const onRunAllocation = async () => {
    if (!selected) return;
    if (!confirm(`Allocate candidates for:\n\n${selected.title}\n\nAvailable seats: ${selected.availableSeats}`)) return;

    setRunning(true);
    try {
      const resp = await runAllocation(selected._id);
      alert(resp.message || 'Allocation completed');
      const results = await getAllocationResults(selected._id);
      setAllocResult(results.allocations || []);
    } catch (err) {
      alert(err.message || 'Allocation failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="loading-state">Loading internships...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div className="page-stack">
      <div className="panel">
        <h3>Internships</h3>
        <div className="internship-grid">
          {internships.map((i) => (
            <div key={i._id} className="internship-card panel">
              <div className="internship-topline">
                <strong>{i.title}</strong>
                <small className="company-name">{i.organization}</small>
              </div>
              <div className="meta-list">
                <span>{i.location}</span>
                <span>{i.role}</span>
                <span>{i.sector}</span>
              </div>
              <div className="card-actions">
                <button type="button" className="secondary-button" onClick={() => onSelect(i)}>Select</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Selected internship</h3>
        {!selected && <div className="empty-state">Select an internship to view allocation options</div>}
        {selected && (
          <div>
            <h4>{selected.title}</h4>
            <p>{selected.organization} • {selected.location}</p>
            <p>Available seats: {selected.availableSeats}</p>
            <div style={{marginTop:16}}> 
              <button className="primary-button" type="button" onClick={onRunAllocation} disabled={running}>{running ? 'Running allocation...' : 'Run Allocation'}</button>
            </div>

            <div style={{marginTop:18}}>
              <h4>Allocation Results</h4>
              {!allocResult && <div className="empty-state">No allocation results yet.</div>}
              {allocResult && allocResult.length > 0 && (
                <div>
                  {allocResult.map((a, idx) => (
                    <div key={a._id || idx} className="recommendation-item" style={{marginTop:8}}>
                      <div>
                        <strong>{idx + 1}. {a.candidate?.name || a.candidateName || 'Candidate'}</strong>
                        <small>{a.candidate?.email}</small>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{color:'#f36c3c', fontWeight:700}}>{a.score}%</div>
                        <div>{a.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
