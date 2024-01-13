import axios from "axios";
import { refreshToken } from "./redux/apiCall";

const BASE_URL = "http://localhost:8888/";

const user = JSON.parse(localStorage.getItem("persist:root"))?.user;
const currentUser = user && JSON.parse(user).currentUser;
const TOKEN = currentUser?.token;

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  // headers: { Authorization: `Bearer ${TOKEN}` },
});


// Add a request interceptor
userRequest.interceptors.request.use((config) => {
  const access_token = localStorage.getItem('access_token');
  config.headers.Authorization = `Bearer ${access_token}`;
  return config;
});

// Add a response interceptor
userRequest.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401 ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('persist:root');
      window.location.reload();
    }
    // status might be undefined
    if (!status) {
      refreshToken();
    }
    return Promise.reject(error);
  }
);
