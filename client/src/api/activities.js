import api from "./axios";

export const getActivities = () => api.get("/api/activities");
export const createActivity = (data) => api.post("/api/activities", data);
export const deleteActivity = (id) => api.delete(`/api/activities/${id}`);