import api from "./api";

const scheduleService = {
  async list(params = {}) {
    const { data } = await api.get("/sessions", { params });
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/sessions", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/sessions/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/sessions/${id}`);
    return data;
  },
};

export default scheduleService;