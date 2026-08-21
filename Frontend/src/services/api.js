const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getStoredSession() {
  try {
    const raw = localStorage.getItem('sih25033-session');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
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

export function submitCandidateFeedback(payload, token) {
  return request('/candidates/me/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getCandidates(token) {
  return request('/candidates', { method: 'GET' }, token);
}

export function getCandidateById(candidateId, token) {
  return request(`/candidates/${candidateId}`, { method: 'GET' }, token);
}

export function createInternship(payload, token) {
  return request('/internships', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function runAllocation(internshipId, payload, token) {
  return request(`/allocation/run/${internshipId}`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  }, token);
}

export function runGlobalAllocation(payload, token) {
  return request('/allocation/run-global', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  }, token);
}

export function getAllocationResults(internshipId, token) {
  return request(`/allocation/internship/${internshipId}`, { method: 'GET' }, token);
}

export function getAllAllocations(token) {
  return request('/allocation/all', { method: 'GET' }, token);
}

export function getAllocationMetrics(token) {
  return request('/allocation/metrics', { method: 'GET' }, token);
}

export function saveCandidatePreferences(payload, token) {
  return request('/candidates/me/preferences', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
}

export function updateAllocationAcceptance(allocationId, status, token) {
  return request(`/allocation/${allocationId}/acceptance`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
}

export function resetAllocations(token) {
  return request('/allocation/reset', {
    method: 'POST',
  }, token);
}

