import api from "./api";

const attendeeService = {
  /* ============ Attendee-facing ============ */
  getDashboard: async () => {
    const { data } = await api.get("/attendee/dashboard");
    return data; // 🔥 Yeh important hai - data extract karo
  },
  getSchedule: async () => {
    const { data } = await api.get("/attendee/schedule");
    return data;
  },
  submitFeedback: async (payload) => {
    const { data } = await api.post("/attendee/feedback", payload);
    return data;
  },

  /* ============ Organizer-facing (attendee management) ============ */
  getAll: async () => {
    const { data } = await api.get("/attendee/all");
    return data;
  },
  checkIn: async (id) => {
    const { data } = await api.patch(`/attendee/${id}/check-in`);
    return data;
  },
  undoCheckIn: async (id) => {
    const { data } = await api.patch(`/attendee/${id}/undo-check-in`);
    return data;
  },
  cancel: async (id) => {
    const { data } = await api.patch(`/attendee/${id}/cancel`);
    return data;
  },
};

export default attendeeService;