import { useEffect, useState } from 'react';
import { getInternships, runAllocation, getAllocationResults } from '../../services/api';

export default function GovernmentAllocationPage() {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');

  // Load internships for dropdown
  useEffect(() => {
    let isMounted = true;
    getInternships()
      .then(data => {
        if (isMounted) setInternships(data.internship || []);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load internships');
      });
    return () => { isMounted = false; };
  }, []);

  const fetchResults = async (internshipId) => {
    setLoading(true);
    setResults(null);
    try {
      const data = await getAllocationResults(internshipId);
      setResults(data);
      setError('');
    } catch (err) {
      if (err.message !== 'No allocation results found') {
        setError(err.message || 'Failed to fetch allocation results');
      } else {
        setError(''); // Just means no results yet
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedInternship(id);
    if (id) {
      fetchResults(id);
    } else {
      setResults(null);
    }
  };

  const handleRunAllocation = async () => {
    if (!selectedInternship) return;
    
    setAllocating(true);
    setError('');
    
    try {
      await runAllocation(selectedInternship);
      await fetchResults(selectedInternship);
      alert('Allocation completed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to run allocation engine.');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> AI ENGINE</p>
          <h2>Seat Allocation Engine</h2>
          <p className="page-subtitle">Run the matching algorithm to allocate seats for open internships.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      <div className="panel">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Select Internship to Allocate</label>
            <select 
              className="form-control" 
              value={selectedInternship} 
              onChange={handleSelectChange}
            >
              <option value="">-- Select an Internship --</option>
              {internships.map(int => (
                <option key={int._id} value={int._id}>{int.title} ({int.organization}) - {int.availableSeats} Seats</option>
              ))}
            </select>
          </div>
          <button 
            type="button" 
            className="primary-button" 
            onClick={handleRunAllocation} 
            disabled={!selectedInternship || allocating}
          >
            {allocating ? 'Processing...' : 'Run Allocation'}
          </button>
        </div>
      </div>

      {loading && <div className="panel loading-state">Fetching allocation results...</div>}

      {results && results.allocations && (
        <div className="panel">
          <div className="status-header" style={{ marginBottom: '1.5rem' }}>
            <h3>Allocation Results</h3>
            <span className="status-badge success">Completed</span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Candidate</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Total Match</th>
                  <th style={{ padding: '1rem' }}>Skills (40%)</th>
                  <th style={{ padding: '1rem' }}>Eligible (20%)</th>
                  <th style={{ padding: '1rem' }}>Role (15%)</th>
                  <th style={{ padding: '1rem' }}>Location (10%)</th>
                  <th style={{ padding: '1rem' }}>Sector (10%)</th>
                  <th style={{ padding: '1rem' }}>Exp (5%)</th>
                </tr>
              </thead>
              <tbody>
                {results.allocations.map(alloc => (
                  <tr key={alloc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{alloc.candidate?.name || 'Unknown'}</strong><br/>
                      <small style={{ color: 'var(--text-muted)' }}>{alloc.candidate?.email}</small>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${alloc.status === 'ALLOCATED' ? 'success' : 'info'}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}><strong>{Number(alloc.score).toFixed(1)}%</strong></td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.skills || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.eligibility || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.role || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.location || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.sector || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(alloc.breakdown?.experience || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!loading && selectedInternship && !results && (
        <div className="empty-state panel">
          <h3>No Allocations Yet</h3>
          <p>This internship hasn't been allocated yet. Click "Run Allocation" to match candidates.</p>
        </div>
      )}
    </div>
  );
}
