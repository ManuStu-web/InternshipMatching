import { useEffect, useMemo, useState } from 'react';
import { getInternships } from '../../services/api2';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await getInternships();
        if (!isMounted) return;
        setInternships(response.internship || []);
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
        ...(item.requiredSkills || [])
      ].join(' ').toLowerCase().includes(search);

      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
      const matchesSector = sectorFilter === 'all' || item.sector === sectorFilter;
      const matchesRole = roleFilter === 'all' || item.role === roleFilter;

      return matchesSearch && matchesLocation && matchesSector && matchesRole;
    });
  }, [internships, locationFilter, sectorFilter, roleFilter, query]);

  return (
    <div className="page-stack">
      <section className="hero-panel compact">
        <div>
          <p className="eyebrow dark"><span /> INTERNSHIPS</p>
          <h2>Discover opportunities</h2>
        </div>
      </section>

      {error && <div className="notice-box error-box">{error}</div>}

      <div className="panel filters-panel">
        <div className="toolbar-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search internship, organization, skills, location"
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
        <div className="panel loading-state">Loading internships…</div>
      ) : visibleInternships.length === 0 ? (
        <div className="panel empty-state">
          <p>No internships are currently available.</p>
        </div>
      ) : (
        <div className="internship-grid">
          {visibleInternships.map((internship) => (
            <article key={internship._id} className="panel internship-card">
              <div className="internship-topline">
                <span className="chip neutral">{internship.status || 'open'}</span>
                <span className="chip info">{internship.availableSeats ?? internship.totalSeats ?? 0} seats</span>
              </div>

              <h3>{internship.title}</h3>
              <p className="company-name">{internship.organization}</p>
              <div className="meta-list">
                <span>{internship.location}</span>
                <span>{internship.sector}</span>
                <span>{internship.role}</span>
              </div>

              <div className="skill-list">
                {(internship.requiredSkills || []).slice(0, 4).map((skill) => (
                  <span key={`${internship._id}-${skill}`} className="chip">{skill}</span>
                ))}
              </div>

              <div className="card-actions">
                <button type="button" className="secondary-button" onClick={() => setSelected(internship)}>View details</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="section-head">
              <h3>{selected.title}</h3>
              <button type="button" className="close-button" onClick={() => setSelected(null)}>×</button>
            </div>
            <p className="company-name">{selected.organization}</p>
            <div className="detail-grid">
              <div><span>Location</span><strong>{selected.location}</strong></div>
              <div><span>Sector</span><strong>{selected.sector}</strong></div>
              <div><span>Role</span><strong>{selected.role}</strong></div>
              <div><span>Status</span><strong>{selected.status || 'open'}</strong></div>
            </div>
            <p className="detail-copy">{selected.description || 'No description available.'}</p>
            <div className="skill-list">
              {(selected.requiredSkills || []).map((skill) => (
                <span key={`${selected._id}-${skill}`} className="chip">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
