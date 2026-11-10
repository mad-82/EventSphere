import api from "./api";

const messageService = {
  async getMyConversations() {
    const { data } = await api.get("/messages");
    return data;
  },
  async create({ subject, category, message }) {
    const { data } = await api.post("/messages", { subject, category, message });
    return data;
  },
  async reply(id, body) {
    const { data } = await api.post(`/messages/${id}/reply`, { body });
    return data;
  },
  // Admin
  async getAllConversations() {
    const { data } = await api.get("/messages/admin/all");
    return data;
  },
  async adminReply(id, body) {
    const { data } = await api.post(`/messages/admin/${id}/reply`, { body });
    return data;
  },
};

export default messageService;