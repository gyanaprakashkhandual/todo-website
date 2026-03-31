export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://toodoo-2o5c.onrender.com",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    GOOGLE_LOGIN: "/oauth2/authorize/google",
    GITHUB_LOGIN: "/oauth2/authorize/github",
  },
  TODOS: {
    BASE: "/api/todos",
    BY_ID: (id: number) => `/api/todos/${id}`,
    STATUS: (id: number) => `/api/todos/${id}/status`,
    STATS: "/api/todos/stats",
    TAGS: "/api/todos/tags",
  },
};

export const TOKEN_KEY = "todo_auth_token";
export const USER_KEY = "todo_auth_user";
