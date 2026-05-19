// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.225.22.190:5000/api',
});

// ── Refresh Token logic ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

// ── Request interceptor → حط التوكن في كل request ────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor → لو 401 جرب تعمل refresh ──────────────────────────
api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      // لو في refresh جاري → استنى في الـ queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      try {
        const res = await axios.post(
          'http://10.225.22.190:5000/api/Users/refresh',
          { refreshToken }
        );

        const newToken        = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        // خزّن التوكنات الجديدة
        localStorage.setItem('token',        newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = 'Bearer ' + newToken;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = 'Bearer ' + newToken;
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // الـ refresh Token انتهى → logout إجباري
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.location.href = '/';
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;