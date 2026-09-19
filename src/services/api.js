export const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ak_cms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Public Data
  async getPortfolio() {
    const res = await fetch(`${API_BASE}/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio data');
    return res.json();
  },

  async sendContactMessage(payload) {
    const res = await fetch(`${API_BASE}/portfolio/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Auth
  async loginAdmin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async verifyToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // --- Admin Protected CRUD Endpoints ---
  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async addSkill(skillData) {
    const res = await fetch(`${API_BASE}/admin/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData)
    });
    return res.json();
  },

  async deleteSkill(category, name) {
    const res = await fetch(`${API_BASE}/admin/skills`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ category, name })
    });
    return res.json();
  },

  async addProject(projectData) {
    const res = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return res.json();
  },

  async updateProject(id, projectData) {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addService(serviceData) {
    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });
    return res.json();
  },

  async deleteService(id) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addBlog(blogData) {
    const res = await fetch(`${API_BASE}/admin/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    return res.json();
  },

  async deleteBlog(id) {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addTestimonial(testimonialData) {
    const res = await fetch(`${API_BASE}/admin/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonialData)
    });
    return res.json();
  },

  async deleteTestimonial(id) {
    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getMessages() {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markMessageRead(id) {
    const res = await fetch(`${API_BASE}/admin/messages/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteMessage(id) {
    const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateSettings(settingsData) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData)
    });
    return res.json();
  }
};
