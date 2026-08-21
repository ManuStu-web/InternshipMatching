import { useEffect, useState } from 'react';
import { getInternships, createInternship } from '../../services/api';
import TagInput from '../../components/TagInput';

export default function GovernmentInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    requiredSkills: [],
    role: '',
    location: '',
    sector: '',
    requiredExperience: 0,
    totalSeats: 1,
    applicationDeadline: ''
  });

  const loadInternships = async () => {
    setLoading(true);
    try {
      const data = await getInternships();
      setInternships(data.internship || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await createInternship({
        ...formData,
        requiredExperience: Number(formData.requiredExperience),
        totalSeats: Number(formData.totalSeats)
      });
      setShowCreateModal(false);
      setFormData({
        title: '', organization: '', description: '', requiredSkills: [],
        role: '', location: '', sector: '', requiredExperience: 0, totalSeats: 1, applicationDeadline: ''
      });
      loadInternships();
    } catch (err) {
      alert(err.message || 'Failed to create internship');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel welcome-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> PROGRAM MANAGEMENT</p>
          <h2>Internships</h2>
          <p className="page-subtitle">Manage open positions and internship opportunities.</p>
        </div>
        <button className="primary-button" onClick={() => setShowCreateModal(true)}>+ Create New</button>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      {showCreateModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Create New Internship</h3>
            <form onSubmit={handleCreateSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Frontend Developer Intern" />
              </div>
              <div className="form-group">
                <label>Organization / Department *</label>
                <input type="text" className="form-control" required value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role *</label>
                  <input type="text" className="form-control" required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" className="form-control" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Sector *</label>
                  <input type="text" className="form-control" required value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Required Experience (Years)</label>
                  <input type="number" className="form-control" min="0" step="0.5" value={formData.requiredExperience} onChange={(e) => setFormData({...formData, requiredExperience: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Total Seats *</label>
                  <input type="number" className="form-control" min="1" required value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input type="date" className="form-control" value={formData.applicationDeadline} onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Required Skills *</label>
                <TagInput tags={formData.requiredSkills} onChange={(skills) => setFormData({...formData, requiredSkills: skills})} placeholder="Add skill and press enter..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={creating}>{creating ? 'Creating...' : 'Create Internship'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel loading-state">Loading internships...</div>
      ) : internships.length === 0 ? (
        <div className="empty-state panel">
          <h3>No Internships</h3>
          <p>There are currently no internships available in the system.</p>
        </div>
      ) : (
        <div className="content-grid dashboard-grid">
          {internships.map(internship => (
            <div key={internship._id} className="panel">
              <div className="status-header">
                <h3>{internship.title}</h3>
                <span className={`status-badge ${internship.availableSeats > 0 ? 'success' : 'muted'}`}>
                  {internship.availableSeats > 0 ? `${internship.availableSeats} Seats` : 'Full'}
                </span>
              </div>
              <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <strong>{internship.organization}</strong> • {internship.location}
              </div>
              
              <ul className="mini-list compact-list">
                <li><strong>Role:</strong> {internship.role}</li>
                <li><strong>Sector:</strong> {internship.sector}</li>
                <li><strong>Skills:</strong> {internship.requiredSkills?.slice(0,3).join(', ') || 'None'} {internship.requiredSkills?.length > 3 ? '...' : ''}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
