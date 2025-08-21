import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../app/store';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Tickets API
export const ticketsAPI = {
  getTickets: (params?: any) => api.get('/tickets', { params }),
  getTicket: (id: number) => api.get(`/tickets/${id}`),
  createTicket: (data: any) => api.post('/tickets', data),
  updateTicket: (id: number, data: any) => api.put(`/tickets/${id}`, data),
  deleteTicket: (id: number) => api.delete(`/tickets/${id}`),
  getTicketStats: () => api.get('/tickets/stats'),
};

// Chat API
export const chatAPI = {
  getMessages: (ticketId: number) => api.get(`/chat/ticket/${ticketId}`),
  sendMessage: (data: { ticketId: number; message: string; isInternal?: boolean }) =>
    api.post('/chat/message', data),
  updateMessage: (messageId: number, data: { message: string }) =>
    api.put(`/chat/message/${messageId}`, data),
  deleteMessage: (messageId: number) =>
    api.delete(`/chat/message/${messageId}`),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export default api;
