import axios from 'axios';

const api = axios.create({
  baseURL: 'https://epaybackend.subhadeep.in',
});

// Attach the bearer token (if present) to every request
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default api;
