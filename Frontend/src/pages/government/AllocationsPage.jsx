import { useEffect, useState } from 'react';
import { getInternships, getAllocationResults } from '../../services/api2';

export default function AllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [selected, setSelected] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await getInternships();
        setInternships(resp?.internship || []);
      } catch {
        setError('Failed to load internships');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const onSelect = async (internship) => {
    setSelected(internship);
    try {
      const resp = await getAllocationResults(internship._id);
      setAllocations(resp.allocations || []);
    } catch {
      setAllocations([]);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
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
                <button type="button" className="secondary-button" onClick={() => onSelect(i)}>View allocations</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Allocations</h3>
        {!selected && <div className="empty-state">Select an internship to view allocations</div>}
        {selected && (
          <div>
            <h4>{selected.title}</h4>
            {!allocations || allocations.length === 0 ? (
              <div className="empty-state">No allocation results found for this internship.</div>
            ) : (
              allocations.map((a, idx) => (
                <div key={a._id || idx} className="recommendation-item" style={{marginTop:8}}>
                  <div>
                    <strong>{idx + 1}. {a.candidate?.name}</strong>
                    <small>{a.candidate?.email}</small>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#f36c3c', fontWeight:700}}>{a.score}%</div>
                    <div>{a.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
