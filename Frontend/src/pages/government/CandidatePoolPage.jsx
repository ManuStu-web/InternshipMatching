import { useEffect, useMemo, useState } from 'react';
import { getCandidateById, getCandidates, getAllAllocations } from '../../services/api';

const notProvided = 'Not provided';

function displayValue(value) {
  if (value === undefined || value === null || value === '') {
    return notProvided;
  }

  return value;
}

function formatDate(value) {
  if (!value) return notProvided;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return notProvided;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function profileStatus(candidate) {
  if (!candidate) return 'Incomplete';

  const hasEducation = Boolean(
    candidate.education?.degree ||
    candidate.education?.branch ||
    candidate.education?.college ||
    candidate.education?.graduationYear
  );

  const hasSkills = Array.isArray(candidate.skills) && candidate.skills.length > 0;
  const hasPreferences =
    (Array.isArray(candidate.preferredLocations) && candidate.preferredLocations.length > 0) ||
    (Array.isArray(candidate.preferredRoles) && candidate.preferredRoles.length > 0) ||
    (Array.isArray(candidate.preferredSectors) && candidate.preferredSectors.length > 0);

  if (candidate.resumeUrl && hasEducation && hasSkills && hasPreferences) {
    return 'Ready';
  }

  return 'Incomplete';
}

function isExternalUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );
}

function TagList({ items, fallback = notProvided }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="detail-copy compact">{fallback}</p>;
  }

  return (
    <div className="chip-list">
      {items.map((item) => (
        <span key={item} className="chip">{item}</span>
      ))}
    </div>
  );
}

function CandidateDetailsModal({ candidateId, onClose }) {
  const [candidate, setCandidate] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getCandidateById(candidateId);
        if (!isMounted) return;
        setCandidate(response.candidate);
        setAllocations(response.allocations || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load candidate details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  const status = profileStatus(candidate);
  const currentAllocation = allocations.find((allocation) => allocation.status === 'ALLOCATED');

  return (
    <div className="modal-backdrop candidate-detail-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel candidate-detail-panel" role="dialog" aria-modal="true" aria-label="Candidate details" onClick={(event) => event.stopPropagation()}>
        <div className="candidate-detail-header">
          <button type="button" className="secondary-button" onClick={onClose}>Back to Registered Candidates</button>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close candidate details">Close</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading candidate details...</div>
        ) : error ? (
          <div className="notice-box error-box">{error}</div>
        ) : candidate ? (
          <div className="candidate-profile">
            <div className="candidate-profile-title">
              <div>
                <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> CANDIDATE PROFILE</p>
                <h2>{displayValue(candidate.name)}</h2>
                <p>{displayValue(candidate.email)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`status-badge ${status === 'Ready' ? 'success' : 'muted'}`}>{status}</span>
                <span className={`status-badge ${currentAllocation ? 'success' : 'muted'}`}>
                  {currentAllocation ? 'ALLOCATED' : 'UNALLOCATED'}
                </span>
              </div>
            </div>

            <section className="candidate-detail-section">
              <h3>Basic Information</h3>
              <div className="detail-grid">
                <DetailItem label="Full Name" value={candidate.name} />
                <DetailItem label="Email" value={candidate.email} />
                <DetailItem label="Phone" value={candidate.phone} />
                <DetailItem label="Eligibility" value={candidate.eligibility ? 'Eligible' : 'Not eligible'} />
              </div>
            </section>

            <section className="candidate-detail-section">
              <h3>Affirmative Action & Demographics (MoCA Priority)</h3>
              <div className="detail-grid">
                <DetailItem label="Social Category" value={candidate.socialCategory || 'General'} />
                <DetailItem label="Gender" value={candidate.gender || notProvided} />
                <DetailItem label="District & State" value={candidate.district ? `${candidate.district}, ${candidate.state || ''}` : notProvided} />
                <DetailItem label="Area Classification" value={candidate.areaType || 'Urban'} />
                <DetailItem label="Aspirational District" value={candidate.isAspirationalDistrict ? 'Yes (NITI Aayog Priority)' : 'No'} />
                <DetailItem label="First Generation Graduate" value={candidate.firstGenerationLearner ? 'Yes' : 'No'} />
                <DetailItem label="Past Beneficiary" value={candidate.pastBeneficiary ? 'Yes (Previous PM Scheme)' : 'No (Fresh Applicant)'} />
              </div>
            </section>

            <section className="candidate-detail-section">
              <h3>Education</h3>
              <div className="detail-grid">
                <DetailItem label="Degree" value={candidate.education?.degree} />
                <DetailItem label="Branch / Specialization" value={candidate.education?.branch} />
                <DetailItem label="College / University" value={candidate.education?.college} />
                <DetailItem label="Graduation Year" value={candidate.education?.graduationYear} />
              </div>
            </section>

            <section className="candidate-detail-section">
              <h3>Skills & Experience</h3>
              <div className="detail-grid single-row">
                <DetailItem label="Experience" value={`${candidate.experience ?? 0} years`} />
              </div>
              <TagList items={candidate.skills} />
            </section>

            <section className="candidate-detail-section">
              <h3>Internship Preferences</h3>
              <div className="preference-grid">
                <div>
                  <span>Preferred Locations</span>
                  <TagList items={candidate.preferredLocations} />
                </div>
                <div>
                  <span>Preferred Roles</span>
                  <TagList items={candidate.preferredRoles} />
                </div>
                <div>
                  <span>Preferred Sectors</span>
                  <TagList items={candidate.preferredSectors} />
                </div>
              </div>
            </section>

            <section className="candidate-detail-section">
              <h3>Documents</h3>
              {candidate.resumeUrl ? (
                isExternalUrl(candidate.resumeUrl) ? (
                  <a className="primary-button candidate-resume-link" href={candidate.resumeUrl} target="_blank" rel="noreferrer">Open Resume</a>
                ) : (
                  <span className="status-badge info">Resume uploaded</span>
                )
              ) : (
                <p className="detail-copy compact">{notProvided}</p>
              )}
            </section>

            <section className="candidate-detail-section">
              <h3>System & Allocation Status</h3>
              <div className="detail-grid">
                <DetailItem label="Candidate ID" value={candidate._id} />
                <DetailItem label="Registered On" value={formatDate(candidate.createdAt)} />
                <DetailItem label="Allocation State" value={currentAllocation ? 'Allocated to Opportunity' : 'Unallocated (In Pool)'} />
                <DetailItem label="Assigned Program" value={currentAllocation?.internship?.title ? `${currentAllocation.internship.title} (${currentAllocation.internship.organization || ''})` : 'None'} />
              </div>

              {allocations.length > 0 ? (
                <div className="allocation-list" style={{ marginTop: '1rem' }}>
                  {allocations.map((allocation) => (
                    <div key={allocation._id} className="allocation-row">
                      <div>
                        <strong>{allocation.internship?.title || 'Internship'}</strong>
                        <small>{allocation.internship?.organization || notProvided}</small>
                        {allocation.reasonSummary && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {allocation.reasonSummary}
                          </div>
                        )}
                      </div>
                      <span className={`status-badge ${allocation.status === 'ALLOCATED' ? 'success' : 'info'}`}>{allocation.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-copy compact">No active allocation records found for this candidate.</p>
              )}
            </section>
          </div>
        ) : (
          <div className="empty-state">Candidate not found.</div>
        )}
      </section>
    </div>
  );
}

export default function GovernmentCandidatePoolPage() {
  const [candidates, setCandidates] = useState([]);
  const [allocationsMap, setAllocationsMap] = useState({});
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [allocationFilter, setAllocationFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    
    const fetchCandidatesAndAllocations = async () => {
      try {
        const [candRes, allocRes] = await Promise.all([
          getCandidates(),
          getAllAllocations().catch(() => ({ allocations: [] })),
        ]);

        if (!isMounted) return;

        setCandidates(candRes.candidates || []);

        const map = {};
        (allocRes.allocations || []).forEach((a) => {
          const cId = a.candidate?._id ? a.candidate._id.toString() : (a.candidate ? a.candidate.toString() : null);
          if (cId && a.status === 'ALLOCATED') {
            map[cId] = a;
          }
        });
        setAllocationsMap(map);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch candidate pool');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchCandidatesAndAllocations();
    return () => { isMounted = false; };
  }, []);

  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();

    return candidates.filter((c) => {
      const cId = c._id.toString();
      const isAllocated = Boolean(allocationsMap[cId]);

      if (allocationFilter === 'ALLOCATED' && !isAllocated) return false;
      if (allocationFilter === 'UNALLOCATED' && isAllocated) return false;

      if (!q) return true;

      const fullString = [
        c.name,
        c.email,
        c.socialCategory,
        c.district,
        c.state,
        c.areaType,
        c.education?.degree,
        c.education?.branch,
        ...(c.skills || []),
      ].join(' ').toLowerCase();

      return fullString.includes(q);
    });
  }, [candidates, allocationsMap, query, allocationFilter]);

  const allocatedCount = Object.keys(allocationsMap).length;
  const unallocatedCount = Math.max(0, candidates.length - allocatedCount);

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> TALENT POOL</p>
          <h2>Registered Candidates & Allocation Status</h2>
          <p className="page-subtitle">
            View nationwide candidates, inspect affirmative action tags, and track real-time placement status.
          </p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      <div className="panel filters-panel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search candidates by name, category, district, skills…"
          style={{ flex: 1, minWidth: '240px' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`secondary-button small-button ${allocationFilter === 'ALL' ? 'active-preset' : ''}`}
            style={{ borderColor: allocationFilter === 'ALL' ? 'var(--primary)' : 'var(--border)' }}
            onClick={() => setAllocationFilter('ALL')}
          >
            All Candidates ({candidates.length})
          </button>
          <button
            type="button"
            className={`secondary-button small-button ${allocationFilter === 'ALLOCATED' ? 'active-preset' : ''}`}
            style={{ borderColor: allocationFilter === 'ALLOCATED' ? 'var(--success)' : 'var(--border)', color: allocationFilter === 'ALLOCATED' ? 'var(--success)' : 'inherit' }}
            onClick={() => setAllocationFilter('ALLOCATED')}
          >
            ✓ Allocated ({allocatedCount})
          </button>
          <button
            type="button"
            className={`secondary-button small-button ${allocationFilter === 'UNALLOCATED' ? 'active-preset' : ''}`}
            style={{ borderColor: allocationFilter === 'UNALLOCATED' ? 'var(--primary)' : 'var(--border)' }}
            onClick={() => setAllocationFilter('UNALLOCATED')}
          >
            ○ Unallocated ({unallocatedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel loading-state">Loading candidate directory and placement states…</div>
      ) : visibleCandidates.length === 0 ? (
        <div className="empty-state panel">
          <h3>No Candidates Found</h3>
          <p>No candidates match your search or allocation filter.</p>
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.9rem' }}>Candidate</th>
                <th style={{ padding: '0.9rem' }}>Inclusivity / Region</th>
                <th style={{ padding: '0.9rem' }}>Degree & Branch</th>
                <th style={{ padding: '0.9rem' }}>Allocation Status</th>
                <th style={{ padding: '0.9rem' }}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {visibleCandidates.map((candidate) => {
                const cId = candidate._id.toString();
                const alloc = allocationsMap[cId];
                const isAllocated = Boolean(alloc);

                return (
                  <tr key={candidate._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.9rem' }}>
                      <button type="button" className="candidate-name-button" onClick={() => setSelectedCandidateId(candidate._id)}>
                        {candidate.name}
                      </button>
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>{candidate.email}</small>
                    </td>
                    <td style={{ padding: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span className="chip" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                          {candidate.socialCategory || 'General'}
                        </span>
                        {candidate.isAspirationalDistrict && (
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
                            ★ {candidate.district || 'Aspirational'}
                          </span>
                        )}
                        {candidate.areaType === 'Rural' && (
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
                      <strong>{candidate.education?.degree || 'N/A'}</strong>
                      <br />
                      <small style={{ color: 'var(--text-secondary)' }}>{candidate.education?.branch || 'N/A'}</small>
                    </td>
                    <td style={{ padding: '0.9rem' }}>
                      {isAllocated ? (
                        <div>
                          <span className="status-badge success">
                            ALLOCATED
                          </span>
                          <small style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600, marginTop: '3px' }}>
                            {alloc.internship?.title || 'Internship'}
                          </small>
                          <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            {alloc.internship?.organization || ''}
                          </small>
                        </div>
                      ) : (
                        <div>
                          <span className="status-badge muted" style={{ opacity: 0.8 }}>
                            UNALLOCATED
                          </span>
                          <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                            In Candidate Pool
                          </small>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem' }}>
                      <span className={`status-badge ${candidate.resumeUrl ? 'success' : 'muted'}`}>
                        {candidate.resumeUrl ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCandidateId && (
        <CandidateDetailsModal candidateId={selectedCandidateId} onClose={() => setSelectedCandidateId('')} />
      )}
    </div>
  );
}
