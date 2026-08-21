import { useEffect, useRef, useState } from 'react';
import { getCandidateProfile, uploadResume } from '../../services/api';

const ACCEPTED_FORMAT = 'PDF only';
const MAX_SIZE = '5 MB';

export default function ResumePage() {
  const [profile, setProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  const loadProfile = async () => {
    try {
      const response = await getCandidateProfile();
      setProfile(response.candidate || null);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load resume status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileSelection = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are accepted.');
      return;
    }

    setSelectedFile(file);
    setSuccess('');
    setError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleFileSelection(file);
  };

  const submitUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a PDF resume to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadResume(formData);
      const result = response.candidate || profile;
      setProfile(result);
      setSuccess(
        response.parsingStatus === 'completed'
          ? 'Resume uploaded and analyzed successfully.'
          : 'Resume uploaded successfully. Resume parsing is temporarily unavailable, so detected details may not update yet.',
      );
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError) {
      const message = uploadError.message || 'We could not upload your resume right now.';
      const friendlyMessage = /parse|processing|parser|fail|error/i.test(message)
        ? 'Resume parsing is currently unavailable. Please try again later.'
        : 'We could not upload your resume. Please try again.';
      setError(friendlyMessage);
    } finally {
      setUploading(false);
    }
  };

  const currentResumeName = profile?.resumeUrl ? profile.resumeUrl.split('/').pop() : '';
  const hasParsedSummary = Boolean(profile && (profile.skills?.length || profile.education || profile.experience !== undefined));

  return (
    <div className="page-stack">
      <section className="hero-panel compact">
        <div>
          <p className="eyebrow dark"><span /> RESUME</p>
          <h2>Upload your resume</h2>
          <p className="page-subtitle">Add your latest resume so InternSetu can understand your background and recommend relevant internships.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {success && <div className="notice-box success-box">{success}</div>}

      {loading ? (
        <div className="panel loading-state">Loading your resume status…</div>
      ) : (
        <div className="content-grid resume-grid">
          <div className="panel upload-panel">
            <div
              className={`upload-box ${isDragging ? 'dragging' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files?.[0] || null;
                handleFileSelection(file);
              }}
            >
              <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFileChange} hidden />
              <div className="upload-icon">↑</div>
              <h3>{selectedFile ? selectedFile.name : currentResumeName || 'Upload resume PDF'}</h3>
              <p>Drag and drop or browse a PDF file.</p>
            </div>

            <div className="upload-meta">
              <small>{ACCEPTED_FORMAT}</small>
              <small>Maximum {MAX_SIZE}</small>
            </div>

            <button type="button" className="primary-button" onClick={submitUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading and analyzing...' : profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
            </button>
          </div>

          <div className="panel">
            <div className="section-head">
              <h3>Resume status</h3>
            </div>

            {!profile?.resumeUrl ? (
              <div className="empty-state compact-empty-state">
                <p>No resume uploaded yet.</p>
                <small>Upload your resume to improve internship recommendations.</small>
              </div>
            ) : (
              <div className="resume-details">
                <div className="current-resume-block">
                  <p>Current resume</p>
                  <strong>{currentResumeName}</strong>
                </div>

                <div className="chip-row">
                  <span className="chip success">Uploaded</span>
                  <span className="chip">{profile.skills?.length || 0} skills detected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasParsedSummary && (
        <div className="panel">
          <div className="section-head">
            <h3>Detected information</h3>
          </div>

          <div className="summary-grid">
            <div>
              <span>Skills detected</span>
              <strong>{profile.skills?.length ? profile.skills.slice(0, 8).join(', ') : 'No skills detected yet'}</strong>
            </div>
            <div>
              <span>Education</span>
              <strong>{profile.education?.degree || 'Not available'} {profile.education?.branch ? `• ${profile.education.branch}` : ''}</strong>
            </div>
            <div>
              <span>Experience</span>
              <strong>{profile.experience ?? 0} years</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
