import { useEffect, useMemo, useState } from 'react';
import { getCandidateProfile, getCandidateRecommendations } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage({ onNavigate }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [profileResponse, recommendationsResponse] = await Promise.all([
          getCandidateProfile(),
          getCandidateRecommendations(),
        ]);

        if (!isMounted) return;
        setProfile(profileResponse.candidate || null);
        setRecommendations(recommendationsResponse.recommendations || []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Unable to load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [session?.token]);

  const completion = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.phone,
      profile.education?.degree,
      profile.education?.branch,
      profile.education?.college,
      Array.isArray(profile.skills) ? profile.skills.length > 0 : false,
      Array.isArray(profile.preferredLocations) ? profile.preferredLocations.length > 0 : false,
      Array.isArray(profile.preferredRoles) ? profile.preferredRoles.length > 0 : false,
      Array.isArray(profile.preferredSectors) ? profile.preferredSectors.length > 0 : false,
      profile.experience !== undefined && profile.experience !== null,
      Boolean(profile.resumeUrl),
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const missingFields = useMemo(() => {
    if (!profile) return [];

    const results = [];
    if (!profile.name) results.push('your name');
    if (!profile.phone) results.push('phone number');
    if (!profile.education?.degree) results.push('education details');
    if (!profile.skills?.length) results.push('skills');
    if (!profile.preferredLocations?.length) results.push('preferred locations');
    if (!profile.preferredRoles?.length) results.push('role preferences');
    if (!profile.resumeUrl) results.push('resume');

    return results;
  }, [profile]);

  const quickActions = [
    { label: 'Complete Profile', description: 'Update education, skills & affirmative action details.', path: '/candidate/profile', icon: '👤' },
    { label: 'Upload Resume', description: 'Parse your latest CV with AI for automatic skill extraction.', path: '/candidate/resume', icon: '📄' },
    { label: 'Explore & Rank', description: 'Discover PM scheme internships and set top 3 preferences.', path: '/candidate/internships', icon: '💼' },
    { label: 'Placement Status', description: 'Track AI matching, seat allocations, and offer status.', path: '/candidate/allocations', icon: '⚑' },
  ];

  const name = profile?.name || session?.user?.name || 'Candidate';
  const skills = profile?.skills?.length ? profile.skills : [];
  const preferredLocations = profile?.preferredLocations?.length ? profile.preferredLocations : [];

  return (
    <div className="page-stack">
      <section className="panel welcome-panel">
        <div>
          <p className="eyebrow dark"><span /> CANDIDATE DASHBOARD</p>
          <h2>Welcome back, {name} 👋</h2>
          <p className="page-subtitle">Complete your profile and upload your resume to receive better internship matches.</p>
        </div>
        <div className="welcome-actions">
          <span className={`status-badge ${profile?.resumeUrl ? 'success' : 'muted'}`}>
            {profile?.resumeUrl ? 'Resume ready' : 'Resume pending'}
          </span>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {loading ? (
        <div className="panel loading-state">Loading your profile and recommendations…</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="panel stat-panel profile-completion-panel">
              <div className="completion-header">
                <div>
                  <p>Your profile progress</p>
                  <strong>{completion}%</strong>
                </div>
                <div className="progress-ring" aria-label={`Profile completion ${completion}%`}>
                  <span>{completion}%</span>
                </div>
              </div>

              <div className="progress-bar"><span style={{ width: `${completion}%` }} /></div>

              <div className="profile-progress-copy">
                {missingFields.length > 0 ? (
                  <>
                    <p>Add {missingFields[0]} and a few more details to improve your recommendation quality.</p>
                    <button type="button" className="secondary-button" onClick={() => onNavigate('/candidate/profile')}>Complete Profile</button>
                  </>
                ) : (
                  <>
                    <p>Your profile is complete and ready for internship discovery.</p>
                    <button type="button" className="secondary-button" onClick={() => onNavigate('/candidate/internships')}>Explore Internships</button>
                  </>
                )}
              </div>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Resume status</p>
                <span className={`status-badge ${profile?.resumeUrl ? 'success' : 'muted'}`}>
                  {profile?.resumeUrl ? 'Uploaded' : 'Not uploaded'}
                </span>
              </div>

              <div className="resume-summary">
                {profile?.resumeUrl ? (
                  <>
                    <strong>Resume uploaded</strong>
                    <small>{skills.length} skills detected and ready for recommendations.</small>
                  </>
                ) : (
                  <>
                    <strong>No resume uploaded yet</strong>
                    <small>Upload your resume to make your internship matches stronger.</small>
                  </>
                )}
              </div>

              <button type="button" className="primary-button small-button" onClick={() => onNavigate('/candidate/resume')}>
                {profile?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
              </button>
            </div>

            <div className="panel stat-panel">
              <div className="status-header">
                <p>Quick profile</p>
                <span className="status-badge info">Active</span>
              </div>

              <ul className="mini-list compact-list">
                <li><strong>Education:</strong> {profile?.education?.degree || 'Not provided'}</li>
                <li><strong>Experience:</strong> {profile?.experience ?? 0} years</li>
                <li><strong>Locations:</strong> {preferredLocations.length ? preferredLocations.slice(0, 2).join(', ') : 'Not set'}</li>
                <li><strong>Eligibility:</strong> {profile?.eligibility === false ? 'No' : 'Yes'}</li>
              </ul>
            </div>
          </div>

          <div className="panel">
            <div className="section-head">
              <div>
                <h3>Quick Actions</h3>
                <p className="page-subtitle" style={{ margin: '2px 0 0', fontSize: '0.84rem' }}>
                  Fast access to manage your internship application pipeline.
                </p>
              </div>
            </div>

            <div className="quick-action-grid">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="quick-action"
                  onClick={() => onNavigate(action.path)}
                >
                  <div className="quick-action-top">
                    <span className="quick-action-icon">{action.icon}</span>
                    <span className="quick-action-arrow">→</span>
                  </div>
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>
          </div>


          <div className="content-grid dashboard-grid">
            <div className="panel">
              <div className="section-head">
                <h3>Profile summary</h3>
              </div>

              <div className="summary-grid">
                <div><span>Education</span><strong>{profile?.education?.degree || 'Not available'} {profile?.education?.branch ? `• ${profile.education.branch}` : ''}</strong></div>
                <div><span>Skills</span><strong>{skills.length ? skills.slice(0, 4).join(', ') : 'Not available'}</strong></div>
                <div><span>Preferred locations</span><strong>{preferredLocations.length ? preferredLocations.join(', ') : 'Not set'}</strong></div>
                <div><span>Preferred roles</span><strong>{profile?.preferredRoles?.length ? profile.preferredRoles.join(', ') : 'Not set'}</strong></div>
                <div><span>Experience</span><strong>{profile?.experience ?? 0} years</strong></div>
                <div><span>Eligibility</span><strong>{profile?.eligibility === false ? 'Not eligible' : 'Eligible'}</strong></div>
              </div>
            </div>

            <div className="panel">
              <div className="section-head">
                <h3>Recommended for you</h3>
              </div>

              {recommendations.length === 0 ? (
                <div className="empty-state compact-empty-state">
                  <p>We need a little more information to find the right internships for you.</p>
                  <small>Complete your profile and upload your resume to improve your recommendations.</small>
                </div>
              ) : (
                <div className="mini-list recommendations-list">
                  {recommendations.slice(0, 3).map((item) => (
                    <div key={item.internship?._id || item.internship?.title} className="recommendation-item">
                      <div>
                        <strong>{item.internship?.title || 'Internship'}</strong>
                        <small>{item.internship?.organization || 'Organization'} • {item.internship?.location || 'Location'}</small>
                      </div>
                      <span>{Number(item.score || 0).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
