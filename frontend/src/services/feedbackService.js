import api from "./api";

const feedbackService = {
  async submit(payload) {
    const { data } = await api.post("/feedback", payload);
    return data;
  },
  async getMyFeedback() {
    const { data } = await api.get("/feedback/me");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/feedback");
    return data;
  },
};

export default feedbackService;