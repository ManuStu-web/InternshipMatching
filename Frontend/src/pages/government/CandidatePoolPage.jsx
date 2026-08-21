import { useEffect, useState } from 'react';
import { getCandidateById, getCandidates } from '../../services/api';

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
      candidate.education?.graduationYear,
  );

  const completedFields = [
    candidate.name,
    candidate.email,
    candidate.phone,
    hasEducation,
    candidate.skills?.length > 0,
    candidate.preferredLocations?.length > 0,
    candidate.preferredRoles?.length > 0,
    candidate.preferredSectors?.length > 0,
    candidate.resumeUrl,
  ].filter(Boolean).length;

  return completedFields >= 7 ? 'Ready' : 'Incomplete';
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );
}

function TagList({ items }) {
  if (!items || items.length === 0) {
    return <p className="detail-copy compact">{notProvided}</p>;
  }

  return (
    <div className="chip-row">
      {items.map((item) => (
        <span className="chip" key={item}>{item}</span>
      ))}
    </div>
  );
}

function isExternalUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
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
        setCandidate(response.candidate || null);
        setAllocations(response.allocations || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to load candidate details');
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
              <span className={`status-badge ${status === 'Ready' ? 'success' : 'muted'}`}>{status}</span>
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
              <h3>System / Allocation Information</h3>
              <div className="detail-grid">
                <DetailItem label="Candidate ID" value={candidate._id} />
                <DetailItem label="Registered On" value={formatDate(candidate.createdAt)} />
                <DetailItem label="Last Updated" value={formatDate(candidate.updatedAt)} />
                <DetailItem label="Current Allocation" value={currentAllocation?.internship?.title || 'Unallocated'} />
              </div>

              {allocations.length > 0 ? (
                <div className="allocation-list">
                  {allocations.map((allocation) => (
                    <div key={allocation._id} className="allocation-row">
                      <div>
                        <strong>{allocation.internship?.title || 'Internship'}</strong>
                        <small>{allocation.internship?.organization || notProvided}</small>
                      </div>
                      <span className={`status-badge ${allocation.status === 'ALLOCATED' ? 'success' : 'info'}`}>{allocation.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-copy compact">No allocation records found.</p>
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
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
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
                  <td style={{ padding: '1rem' }}>
                    <button type="button" className="candidate-name-button" onClick={() => setSelectedCandidateId(candidate._id)}>
                      {candidate.name}
                    </button>
                  </td>
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

      {selectedCandidateId && (
        <CandidateDetailsModal candidateId={selectedCandidateId} onClose={() => setSelectedCandidateId('')} />
      )}
    </div>
  );
}
