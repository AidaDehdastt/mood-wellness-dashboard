import api from "./axios";

export const getDailyLogs = () => api.get("/api/dailylogs");
export const createDailyLog = (data) => api.post("/api/dailylogs", data);
export const updateDailyLog = (id, data) => api.put(`/api/dailylogs/${id}`, data);
export const deleteDailyLog = (id) => api.delete(`/api/dailylogs/${id}`); 