import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://localhost:7100/api';



const getAccessToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};


export const setAccessToken = (token: string): void => {
  sessionStorage.setItem('accessToken', token);
};

export const removeAccessToken = (): void => {
  sessionStorage.removeItem('accessToken');
};



const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axiosInstance.post('/Auth/refresh');

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);
        
        processQueue(null);

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        removeAccessToken();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


const get = <T>(endpoint: string, config = {}) => {
    return axiosInstance.get<T>(endpoint, config).then(res => res.data);
}

const post = <T>(endpoint: string, data?: any, config = {}) => {
    return axiosInstance.post<T>(endpoint, data, config).then(res => res.data);
}

const put = <T>(endpoint: string, data?: any, config = {}) => {
    return axiosInstance.put<T>(endpoint, data, config).then(res => res.data);
}

const del = <T>(endpoint: string, config = {}) => {
    return axiosInstance.delete<T>(endpoint, config).then(res => res.data);
}

const baseService = { get, post, put, del };

export default baseService;