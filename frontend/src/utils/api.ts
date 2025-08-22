import axios from 'axios';

// =================================================================
// FILE: src/api.ts
// This file is now the single source of truth for all Axios configuration.
// =================================================================

export const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
});

// --- Axios Response Interceptor ---
// This is now defined globally for the api instance.
api.interceptors.response.use(
    response => response, // Directly return successful responses
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401 and it's not a retry request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark it as a retry
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Attempt to get a new access token
                    const response = await api.post('/user/token/refresh/', {
                        refresh: refreshToken
                    });
                    const newAccessToken = response.data.access;

                    // Update localStorage and axios defaults
                    localStorage.setItem('accessToken', newAccessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Retry the original request with the new token
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh token is invalid, logging out.", refreshError);
                    // If refresh fails, dispatch a custom event to trigger logout
                    window.dispatchEvent(new Event('logout'));
                }
            } else {
                 // If no refresh token, dispatch logout event
                 window.dispatchEvent(new Event('logout'));
            }
        }
        // For all other errors, just reject the promise
        return Promise.reject(error);
    }
);
