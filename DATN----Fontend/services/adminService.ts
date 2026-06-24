import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const adminAxios = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: { "Content-Type": "application/json" },
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export const adminApi = {
  // --- Dashboard ---
  getStats: () => adminAxios.get("/stats").then((r) => r.data),

  // --- User Management ---
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    banned?: string;
  }) => adminAxios.get("/users", { params }).then((r) => r.data),

  getUserDetail: (id: string) => adminAxios.get(`/users/${id}`).then((r) => r.data),
  updateUserRole: (id: string, role: string) =>
    adminAxios.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  banUser: (id: string) => adminAxios.patch(`/users/${id}/ban`).then((r) => r.data),
  unbanUser: (id: string) => adminAxios.patch(`/users/${id}/unban`).then((r) => r.data),
  deleteUser: (id: string) => adminAxios.delete(`/users/${id}`).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    adminAxios.patch(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),

  // --- Course Management ---
  getCourses: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isPublic?: string;
    sourceType?: string;
  }) => adminAxios.get("/courses", { params }).then((r) => r.data),

  getCourseDetail: (id: string) => adminAxios.get(`/courses/${id}`).then((r) => r.data),
  deleteCourse: (id: string) => adminAxios.delete(`/courses/${id}`).then((r) => r.data),
  toggleFeatured: (id: string) =>
    adminAxios.patch(`/courses/${id}/toggle-featured`).then((r) => r.data),
};
