import api from "./axios";

export const getInsights = () => api.get("/api/insights");
