import api from "./api";

const LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/api/auth/login";
const REGISTER_ENDPOINT = import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || "/api/auth/register";
const LOGOUT_ENDPOINT = import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT || "/api/auth/logout";
const ME_ENDPOINT = import.meta.env.VITE_USER_PROFILE_ENDPOINT || "/api/user/me";

export const authService = {
  async login(email, password) {
    const response = await api.post(LOGIN_ENDPOINT, { email, password });
    return response.data;
  },

  async register(name, email, password, role = "student") {
    const response = await api.post(REGISTER_ENDPOINT, { name, email, password, role });
    return response.data;
  },

  async logout() {
    try {
      await api.post(LOGOUT_ENDPOINT);
    } catch {
      // Stateless fallback
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  async getMe() {
    const response = await api.get(ME_ENDPOINT);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put("/api/auth/profile", profileData);
    return response.data;
  },
};
