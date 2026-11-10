import api from "./api";

const registrationService = {
  async getMyRegistrations() {
    const { data } = await api.get("/registrations/my-tickets");
    return data; // { success: true, tickets: [] }
  },
  async bookTicket(payload) {
    const { data } = await api.post("/registrations", payload);
    return data;
  },
};

export default registrationService;