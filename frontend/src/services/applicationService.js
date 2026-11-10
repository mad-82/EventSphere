import api from "./api";

const applicationService = {
  async getMyApplications(params = {}) {
    const { data } = await api.get("/applications/me", { params });
    return data; // { success, count, applications }
  },

  async getById(id) {
    const { data } = await api.get(`/applications/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/applications", payload);
    return data;
  },

  async withdraw(id) {
    const { data } = await api.delete(`/applications/${id}`);
    return data;
  },
    // Admin - Get All Applications
  async getAllApplications(params = {}) {
    const { data } = await api.get("/applications", { params });
    return data;
  },

  // Admin
  async updateStatus(id, status, rejectionReason = "") {
    const { data } = await api.put(`/applications/${id}/status`, {
      status,
      rejectionReason,
    });
    return data;
  },
};

export default applicationService;