import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

// catch expired/invalid tokens globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;
