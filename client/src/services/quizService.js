import api from "./api";

export const quizService = {
  async submitQuiz(materialId, answers) {
    const response = await api.post(`/api/quizzes/${materialId}/submit`, { answers });
    return response.data;
  },

  async getHistory() {
    const response = await api.get("/api/quizzes/history");
    return response.data;
  },

  async getAttempt(id) {
    const response = await api.get(`/api/quizzes/${id}`);
    return response.data;
  },
};
