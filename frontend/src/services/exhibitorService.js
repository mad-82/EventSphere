import api from "./api";

const exhibitorService = {
  // Company profile
  async getMyProfile() {
    const { data } = await api.get("/exhibitors/me");
    return data; // { success, exhibitor }
  },

  async updateMyProfile(payload) {
    const { data } = await api.put("/exhibitors/me", payload);
    return data;
  },

  // Dashboard
  async getMyDashboard() {
    const { data } = await api.get("/exhibitors/me/dashboard");
    return data; // { success, stats, exhibitor, myBooths, recentApplications }
  },
    // Admin
  async getAllExhibitors() {
    const { data } = await api.get("/exhibitors/admin/all");
    return data;
  },

  // Public directory
  async list(params = {}) {
    const { data } = await api.get("/exhibitors", { params });
    return data;
  },
};

export default exhibitorService;