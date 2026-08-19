import { useEffect, useState } from 'react';
import TagInput from '../../components/TagInput';
import { getCandidateProfile, updateCandidateProfile } from '../../services/api';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  degree: '',
  branch: '',
  college: '',
  graduationYear: '',
  experience: '',
  eligibility: true,
};

export default function ProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [preferredRoles, setPreferredRoles] = useState([]);
  const [preferredSectors, setPreferredSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await getCandidateProfile();
        if (!isMounted) return;
        const candidate = response.candidate || {};

        setForm({
          name: candidate.name || '',
          email: candidate.email || '',
          phone: candidate.phone || '',
          degree: candidate.education?.degree || '',
          branch: candidate.education?.branch || '',
          college: candidate.education?.college || '',
          graduationYear: candidate.education?.graduationYear ?? '',
          experience: candidate.experience ?? '',
          eligibility: candidate.eligibility !== false,
        });

        setSkills(Array.isArray(candidate.skills) ? candidate.skills : []);
        setPreferredLocations(Array.isArray(candidate.preferredLocations) ? candidate.preferredLocations : []);
        setPreferredRoles(Array.isArray(candidate.preferredRoles) ? candidate.preferredRoles : []);
        setPreferredSectors(Array.isArray(candidate.preferredSectors) ? candidate.preferredSectors : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Unable to load profile.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        education: {
          degree: form.degree || undefined,
          branch: form.branch || undefined,
          college: form.college || undefined,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        },
        skills,
        preferredLocations,
        preferredRoles,
        preferredSectors,
        experience: form.experience !== '' ? Number(form.experience) : 0,
        eligibility: form.eligibility,
      };

      await updateCandidateProfile(payload);
      setSuccess('Profile updated successfully.');
    } catch (submitError) {
      setError(submitError.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="panel loading-state">Loading your profile…</div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact">
        <div>
          <p className="eyebrow dark"><span /> MY PROFILE</p>
          <h2>Build your student profile</h2>
          <p className="page-subtitle">Add your details so InternSetu can match you with better internship opportunities.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {success && <div className="notice-box success-box">{success}</div>}

      <form className="panel form-panel-card" onSubmit={handleSubmit}>
        <div className="section-header-with-copy">
          <h3>Personal information</h3>
        </div>
        <div className="field-grid">
          <label className="field-group">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
          </label>

          <label className="field-group">
            <span>Email</span>
            <input value={form.email || 'Not available'} readOnly />
          </label>

          <label className="field-group full-width">
            <span>Phone number</span>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
          </label>
        </div>

        <div className="section-header-with-copy">
          <h3>Education</h3>
        </div>
        <div className="field-grid">
          <label className="field-group">
            <span>Degree</span>
            <input name="degree" value={form.degree} onChange={handleChange} placeholder="B.Tech" />
          </label>

          <label className="field-group">
            <span>Branch</span>
            <input name="branch" value={form.branch} onChange={handleChange} placeholder="Computer Science" />
          </label>

          <label className="field-group">
            <span>College</span>
            <input name="college" value={form.college} onChange={handleChange} placeholder="College name" />
          </label>

          <label className="field-group">
            <span>Graduation year</span>
            <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} placeholder="2026" />
          </label>

          <label className="field-group">
            <span>Experience (years)</span>
            <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="0" min="0" />
          </label>
        </div>

        <div className="section-header-with-copy">
          <h3>Skills</h3>
        </div>
        <TagInput
          label="Add your skills"
          value={skills}
          onChange={setSkills}
          placeholder="Add a skill..."
          helperText="Press Enter to add a skill. Remove any tag with ×."
        />

        <div className="section-header-with-copy">
          <h3>Career preferences</h3>
        </div>
        <TagInput
          label="Preferred locations"
          value={preferredLocations}
          onChange={setPreferredLocations}
          placeholder="Add a preferred location..."
          helperText="Type a location and press Enter."
        />

        <TagInput
          label="Preferred roles"
          value={preferredRoles}
          onChange={setPreferredRoles}
          placeholder="Add a preferred role..."
          helperText="For example: Frontend Developer, Data Analyst"
        />

        <TagInput
          label="Preferred sectors"
          value={preferredSectors}
          onChange={setPreferredSectors}
          placeholder="Add a sector..."
          helperText="For example: Technology, EdTech"
        />

        <label className="checkbox-row">
          <input type="checkbox" name="eligibility" checked={form.eligibility} onChange={handleChange} />
          <span>I am eligible for internship opportunities</span>
        </label>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
