import api from "./axios";

export const getInsights = (weeks = 8) => api.get("/api/insights", { params: { weeks } });
