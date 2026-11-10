import api from "./api";

const boothService = {
  async list(params = {}) {
    const { data } = await api.get("/booths", { params });
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/booths/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/booths", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/booths/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/booths/${id}`);
    return data;
  },
  async reserve(boothId) {
    const { data } = await api.post(`/booths/book/${boothId}`);
    return data;
  },
  async getMyBooth() {
    const { data } = await api.get("/booths/me");
    return data;
  },
  async getBoothRequests() {
    const { data } = await api.get("/booths/requests");
    return data;
  },
  async handleBoothRequest(id, action) {
    const { data } = await api.patch(`/booths/requests/${id}`, { action });
    return data;
  }
};

export default boothService;