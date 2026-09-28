import api from "./api";

export const taskService = {
  async getTasks(completed) {
    const params = {};
    if (completed !== undefined) {
      params.completed = completed;
    }
    const response = await api.get("/api/tasks", { params });
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post("/api/tasks", taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.patch(`/api/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};
