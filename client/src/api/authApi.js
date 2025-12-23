import apiClient from './axiosInstance';

export const authApi = {
  register: (formData) => apiClient.post('/auth/register', formData),
  login: (formData) => apiClient.post('/auth/login', formData),
  logout: () => apiClient.get('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (formData) => apiClient.put('/auth/profile', formData),
  forgotPassword: (email) => apiClient.post('/auth/password/forgot', { email }),
  resetPassword: (token, formData) => 
    apiClient.put(`/auth/password/reset/${token}`, formData),
};
