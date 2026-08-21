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
  gender: 'Prefer not to say',
  socialCategory: 'General',
  district: '',
  state: '',
  areaType: 'Urban',
  isAspirationalDistrict: false,
  pastBeneficiary: false,
  firstGenerationLearner: false,
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
          gender: candidate.gender || 'Prefer not to say',
          socialCategory: candidate.socialCategory || 'General',
          district: candidate.district || '',
          state: candidate.state || '',
          areaType: candidate.areaType || 'Urban',
          isAspirationalDistrict: Boolean(candidate.isAspirationalDistrict),
          pastBeneficiary: Boolean(candidate.pastBeneficiary),
          firstGenerationLearner: Boolean(candidate.firstGenerationLearner),
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
        gender: form.gender,
        socialCategory: form.socialCategory,
        district: form.district,
        state: form.state,
        areaType: form.areaType,
        isAspirationalDistrict: form.isAspirationalDistrict,
        pastBeneficiary: form.pastBeneficiary,
        firstGenerationLearner: form.firstGenerationLearner,
      };

      await updateCandidateProfile(payload);
      setSuccess('Profile updated successfully with Affirmative Action and Inclusivity details.');
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
          <p className="page-subtitle">Add your details so the PM Internship matchmaking engine can find your optimal opportunities.</p>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}
      {success && <div className="notice-box success-box">{success}</div>}

      <form className="panel form-panel-card" onSubmit={handleSubmit}>
        <div className="section-header-with-copy">
          <h3>Personal Information</h3>
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

          <label className="field-group">
            <span>Phone number</span>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
          </label>

          <label className="field-group">
            <span>Gender</span>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>

        {/* Affirmative Action & Inclusivity Details (MoCA Criteria) */}
        <div className="section-header-with-copy" style={{ marginTop: '1.5rem' }}>
          <h3>Affirmative Action & Regional Details (PM Scheme Mandate)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Information provided here enables affirmative action inclusion for rural youth and NITI Aayog Aspirational Districts.
          </p>
        </div>
        <div className="field-grid">
          <label className="field-group">
            <span>Social Category</span>
            <select name="socialCategory" value={form.socialCategory} onChange={handleChange} className="form-control">
              <option value="General">General</option>
              <option value="OBC">OBC (Other Backward Classes)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
            </select>
          </label>

          <label className="field-group">
            <span>Area Classification</span>
            <select name="areaType" value={form.areaType} onChange={handleChange} className="form-control">
              <option value="Urban">Urban / Metro</option>
              <option value="Semi-Urban">Semi-Urban / Tier-2/3</option>
              <option value="Rural">Rural / Gram Panchayat</option>
            </select>
          </label>

          <label className="field-group">
            <span>Home District</span>
            <input name="district" value={form.district} onChange={handleChange} placeholder="e.g. Wayanad, Bahraich, Pune" />
          </label>

          <label className="field-group">
            <span>Home State</span>
            <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Kerala, Uttar Pradesh, Maharashtra" />
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '10px' }}>
          <label className="checkbox-row">
            <input type="checkbox" name="isAspirationalDistrict" checked={form.isAspirationalDistrict} onChange={handleChange} />
            <span><strong>NITI Aayog Aspirational District Resident</strong> (Eligible for priority affirmative weightage)</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="firstGenerationLearner" checked={form.firstGenerationLearner} onChange={handleChange} />
            <span><strong>First-Generation College Graduate in Family</strong></span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="pastBeneficiary" checked={form.pastBeneficiary} onChange={handleChange} />
            <span>I have previously completed an internship under the PM Internship Scheme</span>
          </label>
        </div>

        <div className="section-header-with-copy" style={{ marginTop: '1.5rem' }}>
          <h3>Education</h3>
        </div>
        <div className="field-grid">
          <label className="field-group">
            <span>Degree</span>
            <input name="degree" value={form.degree} onChange={handleChange} placeholder="B.Tech / B.Sc / MCA" />
          </label>

          <label className="field-group">
            <span>Branch</span>
            <input name="branch" value={form.branch} onChange={handleChange} placeholder="Computer Science / Electronics" />
          </label>

          <label className="field-group">
            <span>College</span>
            <input name="college" value={form.college} onChange={handleChange} placeholder="College name" />
          </label>

          <label className="field-group">
            <span>Graduation year</span>
            <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} placeholder="2025" />
          </label>

          <label className="field-group full-width">
            <span>Experience (years)</span>
            <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="0" min="0" />
          </label>
        </div>

        <div className="section-header-with-copy" style={{ marginTop: '1.5rem' }}>
          <h3>Skills</h3>
        </div>
        <TagInput
          label="Add your skills"
          value={skills}
          onChange={setSkills}
          placeholder="Add a skill..."
          helperText="Press Enter to add a skill. Remove any tag with ×."
        />

        <div className="section-header-with-copy" style={{ marginTop: '1.5rem' }}>
          <h3>Career Preferences</h3>
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
          helperText="For example: IT, Defense, Finance, Energy"
        />

        <label className="checkbox-row" style={{ marginTop: '1rem' }}>
          <input type="checkbox" name="eligibility" checked={form.eligibility} onChange={handleChange} />
          <span>I am actively eligible and available for PM internship placements</span>
        </label>

        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile & Update Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
