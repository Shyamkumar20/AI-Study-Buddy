import api from "./api";

export const adminService = {
  async getUsers() {
    const response = await api.get("/api/admin/users");
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },
};
