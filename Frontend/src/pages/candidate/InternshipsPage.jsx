import { useEffect, useMemo, useRef, useState } from 'react';
import { applyForInternship, getInternships } from '../../services/api';
import { useEffect, useMemo, useState } from 'react';
import {
  getInternships,
  getCandidateProfile,
  getCandidateRecommendations,
  saveCandidatePreferences,
} from '../../services/api';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updatingPref, setUpdatingPref] = useState(false);

  const [applying, setApplying] = useState(false);
  const [showAllocationPopup, setShowAllocationPopup] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [intRes, profileRes, recRes] = await Promise.all([
          getInternships(),
          getCandidateProfile().catch(() => null),
          getCandidateRecommendations().catch(() => null),
        ]);

        if (!isMounted) return;

        setInternships(intRes.internship || []);

        if (profileRes?.candidate?.preferences) {
          const prefIds = profileRes.candidate.preferences.map((p) => (p._id ? p._id.toString() : p.toString()));
          setPreferences(prefIds);
        }

        if (recRes?.recommendations) {
          const recMap = {};
          recRes.recommendations.forEach((r) => {
            if (r.internship?._id) {
              recMap[r.internship._id.toString()] = {
                score: r.score,
                breakdown: r.breakdown,
                reasonSummary: r.reasonSummary,
              };
            }
          });
          setRecommendations(recMap);
        }
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Unable to load internships.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  const handleSetPreference = async (internshipId, rankIndex) => {
    setUpdatingPref(true);
    setError('');
    setSuccessMessage('');

    try {
      const currentPrefs = [...preferences].filter((id) => id !== internshipId);
      currentPrefs.splice(rankIndex, 0, internshipId);
      const newPrefs = currentPrefs.slice(0, 3);

      await saveCandidatePreferences({ preferences: newPrefs });
      setPreferences(newPrefs);
      setSuccessMessage(`Updated: Saved as Choice #${rankIndex + 1}!`);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to save preference');
    } finally {
      setUpdatingPref(false);
    }
  };

  const handleRemovePreference = async (internshipId) => {
    setUpdatingPref(true);
    try {
      const newPrefs = preferences.filter((id) => id !== internshipId);
      await saveCandidatePreferences({ preferences: newPrefs });
      setPreferences(newPrefs);
      setSuccessMessage('Removed from preferences.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setUpdatingPref(false);
    }
  };

  const filters = useMemo(() => {
    const locations = [...new Set(internships.map((item) => item.location).filter(Boolean))];
    const sectors = [...new Set(internships.map((item) => item.sector).filter(Boolean))];
    const roles = [...new Set(internships.map((item) => item.role).filter(Boolean))];
    return { locations, sectors, roles };
  }, [internships]);

  const visibleInternships = useMemo(() => {
    const search = query.trim().toLowerCase();

    return internships.filter((item) => {
      const matchesSearch = !search || [
        item.title,
        item.organization,
        item.location,
        item.role,
        item.sector,
        ...(item.requiredSkills || []),
      ].join(' ').toLowerCase().includes(search);

      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
      const matchesSector = sectorFilter === 'all' || item.sector === sectorFilter;
      const matchesRole = roleFilter === 'all' || item.role === roleFilter;

      return matchesSearch && matchesLocation && matchesSector && matchesRole;
    });
  }, [internships, locationFilter, sectorFilter, roleFilter, query]);

  const selectedSeats = selected ? (selected.availableSeats ?? selected.totalSeats ?? 0) : 0;

  const handleApply = async () => {
    if (!selected || applying || selectedSeats <= 0) return;
    setApplying(true);

    try {
      await applyForInternship(selected._id);
      if (!isMountedRef.current) return;
      setApplying(false);
      setShowAllocationPopup(true);
      setInternships((currentInternships) => currentInternships.map((internship) => (
        internship._id === selected._id
          ? { ...internship, availableSeats: Math.max(0, selectedSeats - 1) }
          : internship
      )));
    } catch (applyError) {
      if (!isMountedRef.current) return;
      setApplying(false);
      setError(applyError.message || 'Unable to submit application.');
    }
  };

  const closeAllocationPopup = () => {
    setShowAllocationPopup(false);
    setSelected(null);
  };

  return (
    <div className="page-stack">
      <section className="hero-panel compact">
        <div>
          <p className="eyebrow dark"><span /> PM INTERNSHIP PORTAL</p>
          <h2>Explore & Rank Opportunities</h2>
          <p className="page-subtitle">
            Browse verified enterprise opportunities and set your top 3 preferred internships to guide AI matchmaking.
          </p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {successMessage && <div className="notice-box success-box">{successMessage}</div>}

      <div className="panel filters-panel">
        <div className="toolbar-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search internships, companies, skills, or locations…"
          />
        </div>

        <div className="filter-row">
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="all">All locations</option>
            {filters.locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
            <option value="all">All sectors</option>
            {filters.sectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All roles</option>
            {filters.roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="panel loading-state">Loading verified internships…</div>
      ) : visibleInternships.length === 0 ? (
        <div className="panel empty-state">
          <p>No internships match your selected search criteria.</p>
        </div>
      ) : (
        <div className="internship-grid">
          {visibleInternships.map((internship) => {
            const intId = internship._id.toString();
            const prefIndex = preferences.indexOf(intId);
            const isPreferred = prefIndex !== -1;
            const rec = recommendations[intId];

            return (
              <article
                key={internship._id}
                className="panel internship-card"
                style={{
                  border: isPreferred ? '1px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <div className="internship-topline">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="chip neutral">{internship.status || 'open'}</span>
                    <span className="chip info">{internship.availableSeats ?? internship.totalSeats ?? 0} seats</span>
                  </div>

                  {rec && (
                    <span
                      className="chip"
                      style={{
                        background: 'rgba(20, 125, 104, 0.15)',
                        color: 'var(--success)',
                        fontWeight: 700,
                      }}
                    >
                      {rec.score}% Fit
                    </span>
                  )}
                </div>

                {isPreferred && (
                  <div style={{ margin: '0.4rem 0' }}>
                    <span
                      className="chip"
                      style={{
                        background: 'var(--primary)',
                        color: '#191744',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      ★ Your Choice #{prefIndex + 1}
                    </span>
                  </div>
                )}

                <h3 style={{ marginTop: '0.35rem' }}>{internship.title}</h3>
                <p className="company-name">{internship.organization}</p>

                <div className="meta-list">
                  <span>📍 {internship.location}</span>
                  <span>🏢 {internship.sector}</span>
                  <span>💼 {internship.role}</span>
                </div>

                <div className="skill-list">
                  {(internship.requiredSkills || []).slice(0, 4).map((skill) => (
                    <span key={`${internship._id}-${skill}`} className="chip">{skill}</span>
                  ))}
                </div>

                {/* Preference Selector & Actions */}
                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`secondary-button small-button ${prefIndex === 0 ? 'active-pref-btn' : ''}`}
                      style={{ flex: 1, fontSize: '0.75rem', borderColor: prefIndex === 0 ? 'var(--primary)' : 'var(--border)' }}
                      onClick={() => handleSetPreference(intId, 0)}
                      disabled={updatingPref}
                    >
                      #1 Choice
                    </button>
                    <button
                      type="button"
                      className={`secondary-button small-button ${prefIndex === 1 ? 'active-pref-btn' : ''}`}
                      style={{ flex: 1, fontSize: '0.75rem', borderColor: prefIndex === 1 ? 'var(--primary)' : 'var(--border)' }}
                      onClick={() => handleSetPreference(intId, 1)}
                      disabled={updatingPref}
                    >
                      #2 Choice
                    </button>
                    <button
                      type="button"
                      className={`secondary-button small-button ${prefIndex === 2 ? 'active-pref-btn' : ''}`}
                      style={{ flex: 1, fontSize: '0.75rem', borderColor: prefIndex === 2 ? 'var(--primary)' : 'var(--border)' }}
                      onClick={() => handleSetPreference(intId, 2)}
                      disabled={updatingPref}
                    >
                      #3 Choice
                    </button>
                    {isPreferred && (
                      <button
                        type="button"
                        className="close-button"
                        style={{ fontSize: '0.9rem', padding: '4px' }}
                        title="Remove preference"
                        onClick={() => handleRemovePreference(intId)}
                        disabled={updatingPref}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="card-actions" style={{ margin: 0 }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ width: '100%' }}
                      onClick={() => setSelected({ ...internship, rec })}
                    >
                      View Full AI Fit & Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && !showAllocationPopup && (
        <div className="modal-backdrop" onClick={() => !applying && setSelected(null)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="section-head">
              <h3>{selected.title}</h3>
              <button type="button" className="close-button" onClick={() => setSelected(null)} disabled={applying}>×</button>
      {/* Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="section-head">
              <div>
                <h3>{selected.title}</h3>
                <p className="company-name" style={{ margin: 0 }}>{selected.organization}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setSelected(null)}>×</button>
            </div>

            {selected.rec && (
              <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>AI Match Fit Score</strong>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
                    {selected.rec.score}%
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                  <strong>Match Rationale:</strong> {selected.rec.reasonSummary || 'Strong overall skill and background match'}
                </p>
                {selected.rec.breakdown && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div>Skills Match: {selected.rec.breakdown.skills}%</div>
                    <div>Eligibility: {selected.rec.breakdown.eligibility}%</div>
                    <div>Affirmative Priority: {selected.rec.breakdown.affirmative}%</div>
                    <div>Preference Weight: {selected.rec.breakdown.preference}%</div>
                  </div>
                )}
              </div>
            )}

            <div className="detail-grid">
              <div><span>Location</span><strong>{selected.location}</strong></div>
              <div><span>Sector</span><strong>{selected.sector}</strong></div>
              <div><span>Role</span><strong>{selected.role}</strong></div>
              <div><span>Seats</span><strong>{selected.availableSeats ?? selected.totalSeats ?? 0}</strong></div>
            </div>

            <p className="detail-copy" style={{ marginTop: '1rem' }}>
              {selected.description || 'No detailed description provided for this opening.'}
            </p>

            <div className="skill-list" style={{ marginTop: '1rem' }}>
              {(selected.requiredSkills || []).map((skill) => (
                <span key={`${selected._id}-${skill}`} className="chip">{skill}</span>
              ))}
            </div>

            <div className="detail-actions">
              <button
                type="button"
                className="primary-button"
                disabled={applying || selectedSeats <= 0}
                onClick={handleApply}
              >
                {applying ? (
                  <>
                    <span className="button-spinner" />
                    Submitting application…
                  </>
                ) : selectedSeats <= 0 ? (
                  'No seats available'
                ) : (
                  'Apply Now'
                )}
              </button>
              <button type="button" className="secondary-button" onClick={() => setSelected(null)} disabled={applying}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllocationPopup && (
        <div className="modal-backdrop" onClick={closeAllocationPopup}>
          <div className="success-modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="success-check">✓</div>
            <h3>Allocation Complete!</h3>
            <p>Your application for <strong>{selected?.title}</strong> has been submitted and processed successfully.</p>
            <button type="button" className="primary-button" onClick={closeAllocationPopup}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}