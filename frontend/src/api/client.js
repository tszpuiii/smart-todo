const API_BASE = import.meta.env?.VITE_API_BASE || '/api';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  async register({ name, email, password }) {
    return request('POST', '/auth/register', { name, email, password });
  },
  async login({ email, password }) {
    return request('POST', '/auth/login', { email, password });
  },

  // Tasks
  async listTasks(token, { category, completed } = {}) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (typeof completed === 'boolean') params.set('completed', String(completed));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request('GET', `/tasks${query}`, undefined, token);
  },
  async createTask(token, payload) {
    return request('POST', '/tasks', payload, token);
  },
  async updateTask(token, id, payload) {
    return request('PUT', `/tasks/${id}`, payload, token);
  },
  async toggleTask(token, id) {
    return request('PATCH', `/tasks/${id}/toggle`, undefined, token);
  },
  async deleteTask(token, id) {
    return request('DELETE', `/tasks/${id}`, undefined, token);
  },
  async deleteTasksByCategory(token, category) {
    const qs = `?${new URLSearchParams({ category }).toString()}`;
    return request('DELETE', `/tasks${qs}`, undefined, token);
  },
  async reorderTasks(token, orderedIds) {
    return request('POST', '/tasks/reorder', { orderedIds }, token);
  },
  async aiSuggest(token, payload) {
    return request('POST', '/ai/suggest', payload, token);
  },
  // Lists
  async listLists(token) {
    return request('GET', '/lists', undefined, token);
  },
  async createList(token, name, color) {
    return request('POST', '/lists', { name, color }, token);
  },
  async updateList(token, id, payload) {
    return request('PUT', `/lists/${id}`, payload, token);
  },
  async deleteList(token, id, cascade = false) {
    const qs = cascade ? '?cascade=1' : '';
    return request('DELETE', `/lists/${id}${qs}`, undefined, token);
  }
};


