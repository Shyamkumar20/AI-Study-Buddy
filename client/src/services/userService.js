import api from "./api";

export const userService = {
  async getStats() {
    const response = await api.get("/api/user/stats");
    return response.data;
  },

  async getNotifications() {
    const response = await api.get("/api/user/notifications");
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put("/api/user/profile", profileData);
    return response.data;
  },
};
