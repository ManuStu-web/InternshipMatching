import { useEffect, useState } from 'react';
import {
  getInternships,
  runAllocation,
  runGlobalAllocation,
  getAllocationResults,
  getAllAllocations,
  getAllocationMetrics,
  resetAllocations,
} from '../../services/api';

const DEFAULT_WEIGHTS = {
  skills: 30,
  affirmative: 20,
  preference: 15,
  eligibility: 15,
  role: 15,
  experience: 5,
};

export default function GovernmentAllocationPage() {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('ALL');
  
  const [results, setResults] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Policy Simulator Weight States (Percentages summing to 100)
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [activePreset, setActivePreset] = useState('default');

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [intData, metricsData, allAllocData] = await Promise.all([
          getInternships(),
          getAllocationMetrics().catch(() => null),
          getAllAllocations().catch(() => null),
        ]);

        if (!isMounted) return;
        setInternships(intData.internship || []);
        if (metricsData?.metrics) setMetrics(metricsData.metrics);
        if (allAllocData?.allocations?.length > 0) {
          setResults({
            mode: 'GLOBAL',
            allocations: allAllocData.allocations,
            totalAllocated: allAllocData.allocations.filter((a) => a.status === 'ALLOCATED').length,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to initialize allocation data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleWeightChange = (key, value) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
    setActivePreset('custom');
  };

  const applyPreset = (presetName) => {
    setActivePreset(presetName);
    if (presetName === 'default') {
      setWeights(DEFAULT_WEIGHTS);
    } else if (presetName === 'inclusivity') {
      setWeights({
        skills: 25,
        affirmative: 35, // High Affirmative Priority
        preference: 15,
        eligibility: 15,
        role: 5,
        experience: 5,
      });
    } else if (presetName === 'merit') {
      setWeights({
        skills: 45,
        affirmative: 10,
        preference: 10,
        eligibility: 20,
        role: 10,
        experience: 5,
      });
    }
  };

  const getNormalizedWeightsForApi = () => {
    const factor = totalWeight > 0 ? 1 / totalWeight : 0.01;
    return {
      skills: weights.skills * factor,
      affirmative: weights.affirmative * factor,
      preference: weights.preference * factor,
      eligibility: weights.eligibility * factor,
      role: weights.role * factor,
      experience: weights.experience * factor,
    };
  };

  const handleResetAllocations = async () => {
    setResetting(true);
    setError('');
    setSuccessMessage('');

    try {
      await resetAllocations();
      setResults(null);
      const updatedMetrics = await getAllocationMetrics();
      if (updatedMetrics?.metrics) setMetrics(updatedMetrics.metrics);
      setSuccessMessage('Successfully unallocated all candidates. Allocation engine reset to clean state.');
    } catch (err) {
      setError(err.message || 'Failed to reset allocations');
    } finally {
      setResetting(false);
    }
  };

  const handleRunAllocation = async () => {
    setAllocating(true);
    setError('');
    setSuccessMessage('');

    const normalizedWeights = getNormalizedWeightsForApi();

    try {
      if (selectedInternship === 'ALL') {
        // Nationwide Batch Allocation
        const res = await runGlobalAllocation({ weights: normalizedWeights });
        setResults({
          mode: 'GLOBAL',
          allocations: res.result.allocations,
          ...res.result,
        });
        const updatedMetrics = await getAllocationMetrics();
        if (updatedMetrics?.metrics) setMetrics(updatedMetrics.metrics);
        setSuccessMessage('Nationwide Smart Allocation completed successfully across all PSUs & Enterprises.');
      } else {
        // Single Internship Allocation
        await runAllocation(selectedInternship, { weights: normalizedWeights });
        const res = await getAllocationResults(selectedInternship);
        setResults({
          mode: 'SINGLE',
          allocations: res.allocations,
        });
        const updatedMetrics = await getAllocationMetrics();
        if (updatedMetrics?.metrics) setMetrics(updatedMetrics.metrics);
        setSuccessMessage('Internship seat allocation completed successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to execute allocation engine.');
    } finally {
      setAllocating(false);
    }
  };

  const handleSelectChange = async (e) => {
    const id = e.target.value;
    setSelectedInternship(id);
    setError('');
    setSuccessMessage('');

    if (id === 'ALL') {
      setLoading(true);
      try {
        const allAllocData = await getAllAllocations();
        setResults({
          mode: 'GLOBAL',
          allocations: allAllocData.allocations || [],
        });
      } catch (err) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    } else if (id) {
      setLoading(true);
      try {
        const data = await getAllocationResults(id);
        setResults({
          mode: 'SINGLE',
          allocations: data.allocations || [],
        });
      } catch (err) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-stack">
      {/* Header */}
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark">
            <span style={{ background: 'var(--accent)' }} /> AI SMART ENGINE
          </p>
          <h2>MoCA Allocation & Policy Simulator</h2>
          <p className="page-subtitle">
            AI-driven matchmaking engine with affirmative action quotas, Aspirational Districts inclusivity, and multi-capacity optimization.
          </p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {successMessage && <div className="notice-box success-box">{successMessage}</div>}

      {/* Demographic & Inclusivity Impact Cards */}
      {metrics && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <div className="panel stat-panel">
            <div className="status-header">
              <p>Total Allocated</p>
              <span className="status-badge success">Live</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', margin: '0.6rem 0 0.2rem' }}>
              {metrics.totalAllocated} <small style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {metrics.totalSeats}</small>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Fill Rate: <strong>{metrics.fillRate}%</strong>
            </p>
          </div>

          <div className="panel stat-panel">
            <div className="status-header">
              <p>Aspirational Districts</p>
              <span className="status-badge primary">Inclusivity</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', margin: '0.6rem 0 0.2rem', color: 'var(--primary)' }}>
              {metrics.aspirationalPercentage}%
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {metrics.aspirationalCount} students from NITI Aayog list
            </p>
          </div>

          <div className="panel stat-panel">
            <div className="status-header">
              <p>Rural Representation</p>
              <span className="status-badge info">Affirmative</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', margin: '0.6rem 0 0.2rem', color: 'var(--accent)' }}>
              {metrics.ruralPercentage}%
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {metrics.ruralCount} candidates from rural areas
            </p>
          </div>

          <div className="panel stat-panel">
            <div className="status-header">
              <p>Gender Diversity</p>
              <span className="status-badge success">STEM</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', margin: '0.6rem 0 0.2rem' }}>
              {metrics.femalePercentage}%
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {metrics.femaleCount} women in internships
            </p>
          </div>
        </div>
      )}

      {/* Policy Weight Simulator Panel */}
      <div className="panel form-panel-card">
        <div className="section-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3>Policy Weight Simulator ("What-If" Analysis)</h3>
            <p className="page-subtitle" style={{ margin: 0, fontSize: '0.88rem' }}>
              Adjust policy priorities before running allocations. Total weight must sum to 100%.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`secondary-button small-button ${activePreset === 'default' ? 'active-preset' : ''}`}
              style={{ borderColor: activePreset === 'default' ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => applyPreset('default')}
            >
              Balanced (MoCA)
            </button>
            <button
              type="button"
              className={`secondary-button small-button ${activePreset === 'inclusivity' ? 'active-preset' : ''}`}
              style={{ borderColor: activePreset === 'inclusivity' ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => applyPreset('inclusivity')}
            >
              Affirmative & Rural Boost
            </button>
            <button
              type="button"
              className={`secondary-button small-button ${activePreset === 'merit' ? 'active-preset' : ''}`}
              style={{ borderColor: activePreset === 'merit' ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => applyPreset('merit')}
            >
              Skills & Merit Focus
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Skill & Technical Match</span>
              <strong>{weights.skills}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={weights.skills}
              onChange={(e) => handleWeightChange('skills', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Affirmative Action (Aspirational/Rural/SC/ST)</span>
              <strong style={{ color: 'var(--accent)' }}>{weights.affirmative}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.affirmative}
              onChange={(e) => handleWeightChange('affirmative', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Candidate Choice Preference</span>
              <strong>{weights.preference}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.preference}
              onChange={(e) => handleWeightChange('preference', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Degree & Branch Eligibility</span>
              <strong>{weights.eligibility}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.eligibility}
              onChange={(e) => handleWeightChange('eligibility', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Role & Sector Alignment</span>
              <strong>{weights.role}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.role}
              onChange={(e) => handleWeightChange('role', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
              <span>Experience Bonus</span>
              <strong>{weights.experience}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={weights.experience}
              onChange={(e) => handleWeightChange('experience', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Allocation Scope</label>
            <select
              className="form-control"
              value={selectedInternship}
              onChange={handleSelectChange}
            >
              <option value="ALL">⚡ Nationwide Batch Allocation (All Open Positions)</option>
              {internships.map((int) => (
                <option key={int._id} value={int._id}>
                  {int.title} ({int.organization}) - {int.availableSeats} Seats
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleResetAllocations}
            disabled={allocating || resetting}
            style={{ height: '44px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            title="Clear all allocations and reset candidate status"
          >
            {resetting ? 'Resetting…' : '↺ Unallocate All'}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleRunAllocation}
            disabled={allocating || resetting}
            style={{ height: '44px', minWidth: '220px' }}
          >
            {allocating ? 'Processing Smart Allocation…' : selectedInternship === 'ALL' ? '⚡ Run Nationwide Allocation' : 'Run Internship Match'}
          </button>
        </div>
      </div>


      {loading && <div className="panel loading-state">Fetching live allocation results…</div>}

      {/* Allocation Results Table */}
      {results && results.allocations && results.allocations.length > 0 && (
        <div className="panel">
          <div className="status-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3>
                {selectedInternship === 'ALL' ? 'Nationwide Allocation Results' : 'Internship Match Results'}
              </h3>
              <p className="page-subtitle" style={{ margin: 0, fontSize: '0.85rem' }}>
                Showing {results.allocations.length} candidate evaluations.
              </p>
            </div>
            <span className="status-badge success">Engine Synchronized</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.9rem' }}>Candidate</th>
                  <th style={{ padding: '0.9rem' }}>Social & Regional Tag</th>
                  <th style={{ padding: '0.9rem' }}>Allocated Program</th>
                  <th style={{ padding: '0.9rem' }}>Status</th>
                  <th style={{ padding: '0.9rem' }}>Match Score</th>
                  <th style={{ padding: '0.9rem' }}>Explainable AI Rationale</th>
                </tr>
              </thead>
              <tbody>
                {results.allocations.map((alloc) => {
                  const cand = alloc.candidate || {};
                  const candName = cand.name || alloc.candidateName || 'Candidate';
                  const candEmail = cand.email || alloc.candidateEmail || '';
                  const category = cand.socialCategory || alloc.candidateCategory || 'General';
                  const isAspirational = cand.isAspirationalDistrict || alloc.isAspirationalDistrict;
                  const district = cand.district || alloc.district || '';
                  const areaType = cand.areaType || alloc.areaType || 'Urban';
                  const intTitle = alloc.internship?.title || alloc.internshipTitle || 'Internship';
                  const intOrg = alloc.internship?.organization || alloc.organization || '';

                  return (
                    <tr key={alloc._id || alloc.candidateId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem' }}>
                        <strong>{candName}</strong><br />
                        <small style={{ color: 'var(--text-muted)' }}>{candEmail}</small>
                      </td>
                      <td style={{ padding: '0.9rem' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="chip" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                            {category}
                          </span>
                          {isAspirational && (
                            <span
                              className="chip"
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 7px',
                                background: 'rgba(243, 108, 60, 0.15)',
                                color: 'var(--accent)',
                                borderColor: 'var(--accent)',
                              }}
                            >
                              ★ {district ? `Aspirational (${district})` : 'Aspirational'}
                            </span>
                          )}
                          {areaType === 'Rural' && (
                            <span
                              className="chip"
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 7px',
                                background: 'rgba(20, 125, 104, 0.15)',
                                color: 'var(--success)',
                              }}
                            >
                              Rural
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem' }}>
                        <strong>{intTitle}</strong><br />
                        <small style={{ color: 'var(--text-secondary)' }}>{intOrg}</small>
                      </td>
                      <td style={{ padding: '0.9rem' }}>
                        <span className={`status-badge ${alloc.status === 'ALLOCATED' ? 'success' : 'info'}`}>
                          {alloc.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: alloc.score >= 70 ? 'var(--success)' : 'var(--text-primary)' }}>
                          {Number(alloc.score).toFixed(1)}%
                        </strong>
                      </td>
                      <td style={{ padding: '0.9rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {alloc.reasonSummary || 'Direct Merit & Eligibility Fit'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && (!results || !results.allocations || results.allocations.length === 0) && (
        <div className="empty-state panel">
          <h3>No Active Allocations</h3>
          <p>Click "Run Nationwide Allocation" or select a specific internship to compute smart allocations.</p>
        </div>
      )}
    </div>
  );
}

