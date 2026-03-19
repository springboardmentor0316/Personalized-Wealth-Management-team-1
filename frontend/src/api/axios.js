import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token logic
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    //  Prevent crash
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");

      //  No refresh token
      if (!refresh) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
        "http://127.0.0.1:8000/auth/refresh",
         { token: refresh }
        );

        const newToken = res.data.access_token;
        localStorage.setItem("access_token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);

      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;