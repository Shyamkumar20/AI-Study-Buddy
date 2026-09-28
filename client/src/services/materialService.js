import api from "./api";

export const materialService = {
  async getMaterials() {
    const response = await api.get("/api/materials");
    return response.data;
  },

  async getMaterial(id) {
    const response = await api.get(`/api/materials/${id}`);
    return response.data;
  },

  async uploadMaterial(file, title) {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const response = await api.post("/api/materials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/api/materials/${id}`);
    return response.data;
  },

  async summarize(id) {
    const response = await api.post(`/api/materials/${id}/summarize`);
    return response.data;
  },

  async generateFlashcards(id, count = 5) {
    const response = await api.post(`/api/materials/${id}/flashcards`, { count });
    return response.data;
  },

  async generateQuiz(id, count = 5) {
    const response = await api.post(`/api/materials/${id}/quiz`, { count });
    return response.data;
  },

  async generateStudyPlan(id, planParams = {}) {
    const response = await api.post(`/api/materials/${id}/study-plan`, planParams);
    return response.data;
  },

  async askMaterial(id, { question, history }) {
    const response = await api.post(`/api/materials/${id}/ask`, { question, history });
    return response.data;
  },

  async generateTasks(id) {
    const response = await api.post(`/api/materials/${id}/tasks`);
    return response.data;
  },
};
