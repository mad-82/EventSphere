import api from "./api";

const staffService = {
  async getMyStaff() {
    const { data } = await api.get("/staff");
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/staff", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/staff/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/staff/${id}`);
    return data;
  },
};

export default staffService;