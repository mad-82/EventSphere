import api from "./api";

const authService = {
  async register({ name, email, password, phone, role }) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
      role,
    });
    return data; // { success, message, token, user }
  },

  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  async getMe() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  async forgotPassword({ email }) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword({ token, password }) {
    const { data } = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return data;
  },

  async changePassword({ currentPassword, newPassword }) {
    const { data } = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async updateProfile(updates) {
    const { data } = await api.put("/auth/profile", updates);
    return data;
  },
};

export default authService;