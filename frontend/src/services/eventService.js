import api from "./api";

const eventService = {
  async list(params = {}) {
    const { data } = await api.get("/events", { params });
    return data; // { success, count, expos }
  },

  async getById(id) {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/events", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/events/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/events/${id}`);
    return data;
  },

  async togglePublish(id) {
    const { data } = await api.patch(`/events/${id}/publish`);
    return data;
  },
};

export default eventService;