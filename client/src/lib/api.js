import axios from "axios";
import { API_URL } from "../config";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function authConfig(token, config = {}) {
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

function unwrap(error) {
  // Handle network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      return Promise.reject(
        new Error(`Network error: Unable to reach server at ${API_URL}. Please ensure the server is running.`)
      );
    }
    return Promise.reject(
      new Error(error.message || "Network error. Please check your connection and try again.")
    );
  }

  // Handle API errors
  return Promise.reject(
    new Error(error.response?.data?.message || error.message || "Request failed.")
  );
}

export const api = {
  get: (path, token, config) =>
    client.get(path, authConfig(token, config)).then((response) => response.data).catch(unwrap),
  post: (path, body, token, config) => {
    const reqConfig = authConfig(token, config);
    if (body instanceof FormData) {
      reqConfig.headers = reqConfig.headers || {};
      reqConfig.headers["Content-Type"] = "multipart/form-data";
    }
    return client
      .post(path, body, reqConfig)
      .then((response) => response.data)
      .catch(unwrap);
  },
  patch: (path, body, token, config) => {
    const reqConfig = authConfig(token, config);
    if (body instanceof FormData) {
      reqConfig.headers = reqConfig.headers || {};
      reqConfig.headers["Content-Type"] = "multipart/form-data";
    }
    return client
      .patch(path, body, reqConfig)
      .then((response) => response.data)
      .catch(unwrap);
  },
  delete: (path, token, config) =>
    client.delete(path, authConfig(token, config)).then((response) => response.data).catch(unwrap),
};
