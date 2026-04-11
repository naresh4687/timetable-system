import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  create: (data) => api.post('/users', data),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  bulkDelete: (ids) => api.post('/users/bulk-delete', { ids }),
  getStaff: () => api.get('/users/staff'),
  getStaffCount: () => api.get('/users/staff-count'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (formData) => api.post('/users/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Timetables ──────────────────────────────────────────────────────────────
export const timetableAPI = {
  create: (data) => api.post('/timetables', data),
  getAll: (params) => api.get('/timetables', { params }),
  getById: (id) => api.get(`/timetables/${id}`),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  updateStatus: (id, data) => api.patch(`/timetables/${id}/status`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
  downloadPDF: async (id, filename) => {
    const response = await api.get(`/timetables/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'timetable.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ─── Subject Expectations ────────────────────────────────────────────────────
export const expectationAPI = {
  submit: (data) => api.post('/expectations', data),
  getMyExpectation: () => api.get('/expectations/me'),
  getAll: () => api.get('/expectations'),
  getEfficiency: (year) =>
    api.get(`/expectations/efficiency`, {
      params: { academicYear: year ? year.replace(/–/g, '-') : year },
    }),
  autoAssign: (data) => api.post('/expectations/auto-assign', data),
  delete: (id) => api.delete(`/expectations/${id}`),
};

// ─── Curriculum ──────────────────────────────────────────────────────────────
export const curriculumAPI = {
  getAll: () => api.get('/curriculum'),
  getBySemester: (sem) => api.get(`/curriculum/${sem}`),
  save: (data) => api.post('/curriculum', data),
  delete: (sem) => api.delete(`/curriculum/${sem}`),
  generate: (data) => api.post('/curriculum/generate', data),
  generateBySemester: (semester, data) => api.post(`/curriculum/generate/${semester}`, data),
  parseFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/curriculum/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Subject Selection ────────────────────────────────────────────────────────
export const subjectAPI = {
  getAcademicYears: () => api.get('/subjects/academic-years'),
  getSemesters: (year, type) => api.get(`/subjects/semesters?year=${year.replace(/–/g, '-')}&type=${type}`),
  getSubjects: (year, type, semester) =>
    api.get(`/subjects`, {
      params: {
        year: year ? year.replace(/–/g, '-') : year,
        type,
        semester: Number(semester),
      },
    }),
};

// ─── Master Subjects ─────────────────────────────────────────────────────────
export const masterSubjectAPI = {
  getAll: () => api.get('/subjects/master'),
  create: (data) => api.post('/subjects/master', data),
};

// ─── Assignments ─────────────────────────────────────────────────────────────
export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getAll: () => api.get('/assignments'),
  getById: (id) => api.get(`/assignments/${id}`),
  adminApprove: (id, data) => api.put(`/assignments/admin-approve/${id}`, data),
  managerApprove: (id, data) => api.put(`/assignments/manager-approve/${id}`, data),
  reject: (id, data) => api.put(`/assignments/reject/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  getPDFUrl: (id) => `${API_BASE}/assignments/${id}/pdf`,
};

// ─── Departments ─────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const constraintAPI = {
  create: (data) => api.post('/constraints', data),
  getAll: (params) => api.get('/constraints', { params }),
  getByStaff: (staffId) => api.get(`/constraints/staff/${staffId}`),
  update: (id, data) => api.put(`/constraints/${id}`, data),
  delete: (id) => api.delete(`/constraints/${id}`),
};

export const batchAPI = {
  getAll: () => api.get('/batch'),
  create: (data) => api.post('/batch', data),
  update: (id, data) => api.put(`/batch/${id}`, data),
  delete: (id) => api.delete(`/batch/${id}`),
};

export default api;
