import axios from "axios";

// Production API URL for Render backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds for Render (can be slow on free tier)
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - Render backend might be sleeping");
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const studentsApi = {
  getAll: async () => {
    const response = await api.get("/students");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post("/students", studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  exportCSV: async () => {
    const response = await api.get("/students/export/csv", {
      responseType: "blob",
    });
    return response.data;
  },
};

export const codeforcesApi = {
  getContests: async (studentId, days = 365) => {
    const response = await api.get(`/codeforces/contests/${studentId}`, {
      params: { days },
    });
    return response.data;
  },

  getProblems: async (studentId, days = 90) => {
    const response = await api.get(`/codeforces/problems/${studentId}`, {
      params: { days },
    });
    return response.data;
  },
};

export const settingsApi = {
  get: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  update: async (settings) => {
    const response = await api.put("/settings", settings);
    return response.data;
  },
};

export default api;
