const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getStoredSession() {
  try {
    const raw = localStorage.getItem('sih25033-session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function request(path, options = {}, tokenOverride) {
  const session = tokenOverride || getStoredSession();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function candidateLogin(payload) {
  return request('/candidates/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function candidateRegister(payload) {
  return request('/candidates/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function governmentLogin(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCandidateProfile(token) {
  return request('/candidates/me', { method: 'GET' }, token);
}

export function updateCandidateProfile(payload, token) {
  return request('/candidates/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
}

export function uploadResume(formData, token) {
  return request('/candidates/resume', {
    method: 'POST',
    body: formData,
  }, token);
}

export function getInternships(token) {
  return request('/internships', { method: 'GET' }, token);
}

export function getCandidateRecommendations(token) {
  return request('/candidates/me/recommendations', { method: 'GET' }, token);
}

export function getCandidateAllocations(token) {
  return request('/candidates/me/allocations', { method: 'GET' }, token);
}

export function applyForInternship(internshipId, token) {
  return request(`/candidates/me/apply/${internshipId}`, { method: 'POST' }, token);
}

export function submitCandidateFeedback(payload, token) {
  return request('/candidates/me/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getCandidates(token) {
  return request('/candidates', { method: 'GET' }, token);
}

export function createInternship(payload, token) {
  return request('/internships', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function runAllocation(internshipId, token) {
  return request(`/allocation/run/${internshipId}`, { method: 'POST' }, token);
}

export function getAllocationResults(internshipId, token) {
  return request(`/allocation/internship/${internshipId}`, { method: 'GET' }, token);
}
