import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_URL, DEBUG_API } from '@/(shared)/config/constants';

import { getInitialToken, getRefreshToken } from '../utils/localstorage';

const debugAPILog = (config: AxiosRequestConfig, responseTime: number) => {
  if (DEBUG_API === 'on') {
    console.debug(
      `${responseTime / 1000}s request: ${config.url} body: ${JSON.stringify(
        config.data
      )} params: ${JSON.stringify(config.params)}`
    );
  }
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

let retryCount = 0;
const MAX_RETRIES = 1;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  config => {
    const accessToken = getInitialToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401) {
      console.log('[Auth Interceptor] 401 error detected:', {
        url: originalRequest.url,
        isRetry: originalRequest._retry,
        isRefreshing,
        hasRefreshToken: !!getRefreshToken()
      });

      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('[Auth Interceptor] Refresh token request failed, clearing auth data');
        clearAuthData();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('[Auth Interceptor] Already refreshing, adding to queue');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (token) {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
            }
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      if (originalRequest._retry) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          console.log('[Auth Interceptor] Max retries reached, clearing auth data');
          clearAuthData();
          retryCount = 0;
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthData();
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        console.log('[Auth Interceptor] Token refresh successful');

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        retryCount = 0;

        processQueue(null, accessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Auth Interceptor] Token refresh failed:', refreshError);
        // Refresh failed, clear all auth data
        clearAuthData();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  isRefreshing = false;
  failedQueue = [];
  retryCount = 0;
};

export const clearAuthTokens = () => {
  console.log('[Auth] Manually clearing auth tokens');
  clearAuthData();
};

export const isAuthenticated = (): boolean => {
  const accessToken = getInitialToken();
  const refreshToken = getRefreshToken();
  return !!(accessToken && refreshToken);
};

export const axiosRequest = async <TResponseData = unknown>(
  config: AxiosRequestConfig
): Promise<TResponseData> => {
  try {
    const startTime = Date.now();
    const response = await axiosInstance(config);
    const responseTime = Date.now() - startTime;
    debugAPILog(config, responseTime);
    return response.data;
  } catch (err) {
    const error = err as AxiosError;

    console.error(
      `API Error [${config.method?.toUpperCase()} ${config.url}]:`,
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        message: 'Network Error',
        status: 500,
      }
    );
  }
};
