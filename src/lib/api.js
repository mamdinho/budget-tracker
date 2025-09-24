// src/lib/api.js
import { useAuth } from '../context/AuthContext';

function buildUrl(path) {
  const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function useApi() {
  const { getAccessToken } = useAuth();

  async function request(path, { method = 'GET', body, query } = {}) {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const qs =
      query && Object.keys(query).length
        ? '?' + new URLSearchParams(query).toString()
        : '';

    const res = await fetch(buildUrl(path + qs), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.detail || json?.error || res.statusText);
    return json;
  }

  // Transactions (returns {items,total,page,pageSize})
  async function listTransactions(params = {}) {
    const r = await request('/api/transactions', { query: params });
    if (Array.isArray(r)) {
      return { items: r, total: r.length, page: 1, pageSize: r.length };
    }
    return r;
  }
  function createTransaction(data) {
    return request('/api/transactions', { method: 'POST', body: data });
  }
  function updateTransaction(id, data) {
    return request(`/api/transactions/${id}`, { method: 'PUT', body: data });
  }
  function deleteTransaction(id) {
    return request(`/api/transactions/${id}`, { method: 'DELETE' });
  }

  // Summary
  function getSummary(params = {}) {
    return request('/api/stats/summary', { query: params });
  }

  // Category suggestions
  function getCategories(params = {}) {
    return request('/api/transactions/categories', { query: params });
  }

  return {
    request,
    listTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary,
    getCategories,
  };
}
