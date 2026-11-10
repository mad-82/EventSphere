import api from "./api";

const notificationService = {
  async getMyNotifications() {
    const { data } = await api.get("/notifications");
    return data;
  },

  async markRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead() {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};

export default notificationService;