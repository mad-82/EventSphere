import api from "./api";

const analyticsService = {
  /* ============ Existing analytics page endpoints ============ */
  getOverview:             () => api.get("/analytics/overview"),
  getRegistrationTrend:    () => api.get("/analytics/registrations-trend"),
  getApplicationAnalytics: () => api.get("/analytics/application-analytics"),
  getBoothOccupancy:       () => api.get("/analytics/booth-occupancy"),
  getSessionPopularity:    () => api.get("/analytics/session-popularity"),
  getEventComparison:      () => api.get("/analytics/event-comparison"),

  /* ============ All-in-one ============ */
  getAllAnalytics:         () => api.get("/analytics/all"),
  getAll:                  () => api.get("/analytics/all"),   // alias

  /* ============ Organizer dashboard (single call) ============ */
  getDashboard:            () => api.get("/analytics/dashboard"),
};

export default analyticsService;