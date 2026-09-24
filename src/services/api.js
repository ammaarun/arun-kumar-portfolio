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

  async getPortfolioBySlug(slug) {
    const res = await fetch(`${API_BASE}/portfolio/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Portfolio not found');
    }
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
  },

  // --- Phase 3 Extensions ---
  async getMedia(category = 'all', search = '') {
    const query = new URLSearchParams({ category, search }).toString();
    const res = await fetch(`${API_BASE}/admin/media?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async uploadMedia(mediaData) {
    const res = await fetch(`${API_BASE}/admin/media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mediaData)
    });
    return res.json();
  },

  async updateMedia(id, mediaData) {
    const res = await fetch(`${API_BASE}/admin/media/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(mediaData)
    });
    return res.json();
  },

  async deleteMedia(id) {
    const res = await fetch(`${API_BASE}/admin/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getResumes() {
    const res = await fetch(`${API_BASE}/admin/resumes`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async uploadResume(resumeData) {
    const res = await fetch(`${API_BASE}/admin/resumes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resumeData)
    });
    return res.json();
  },

  async selectResume(id) {
    const res = await fetch(`${API_BASE}/admin/resumes/${id}/select`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteResume(id) {
    const res = await fetch(`${API_BASE}/admin/resumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getSeo() {
    const res = await fetch(`${API_BASE}/admin/seo`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateSeo(seoData) {
    const res = await fetch(`${API_BASE}/admin/seo`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(seoData)
    });
    return res.json();
  },

  async getBranding() {
    const res = await fetch(`${API_BASE}/admin/branding`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateBranding(brandingData) {
    const res = await fetch(`${API_BASE}/admin/branding`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(brandingData)
    });
    return res.json();
  },

  async updateSlug(slug) {
    const res = await fetch(`${API_BASE}/admin/slug`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slug })
    });
    return res.json();
  },

  async getActivities() {
    const res = await fetch(`${API_BASE}/admin/activities`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
