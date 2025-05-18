import axios from 'axios';
import { HOST_API_KEY } from './globalConfig';

const axiosInstance = axios.create({ baseURL: HOST_API_KEY });

// Ajout automatique du token JWT dans les headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response) || 'General Axios Error happend')
);

export default axiosInstance;