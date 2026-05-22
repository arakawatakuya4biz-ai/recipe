const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Inventory - Vegetables
export const api = {
  vegetables: {
    list: () => request('/inventory/vegetables'),
    create: (data) => request('/inventory/vegetables', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/vegetables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/inventory/vegetables/${id}`, { method: 'DELETE' }),
  },
  fridge: {
    list: () => request('/inventory/fridge'),
    create: (data) => request('/inventory/fridge', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/fridge/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/inventory/fridge/${id}`, { method: 'DELETE' }),
  },
  freezer: {
    list: () => request('/inventory/freezer'),
    create: (data) => request('/inventory/freezer', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/freezer/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/inventory/freezer/${id}`, { method: 'DELETE' }),
  },
  roomTemp: {
    list: () => request('/inventory/room_temp'),
    create: (data) => request('/inventory/room_temp', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/room_temp/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/inventory/room_temp/${id}`, { method: 'DELETE' }),
  },
  meals: {
    list: (year, month) => request(`/meals${year && month ? `?year=${year}&month=${month}` : ''}`),
    create: (data) => request('/meals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/meals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/meals/${id}`, { method: 'DELETE' }),
  },
  shopping: {
    list: () => request('/shopping'),
    create: (data) => request('/shopping', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/shopping/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/shopping/${id}`, { method: 'DELETE' }),
    clearChecked: () => request('/shopping', { method: 'DELETE' }),
  },
  memos: {
    list: () => request('/memos'),
    create: (data) => request('/memos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/memos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/memos/${id}`, { method: 'DELETE' }),
  },
  recipes: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.category) q.set('category', params.category);
      if (params.reaction) q.set('reaction', params.reaction);
      if (params.ingredient) q.set('ingredient', params.ingredient);
      const qs = q.toString();
      return request(`/recipes${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/recipes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/recipes/${id}`, { method: 'DELETE' }),
  },
};
