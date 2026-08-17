import api from "./api";

const TOKEN_KEY = "access_token";
const ROLE_KEY = "user_role";

export async function login(username, password) {
  const response = await api.post("/login", {
    username,
    password,
  });

  const token = response.data.access_token;

  if (!token) {
    throw new Error("Login response did not contain an access token.");
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ROLE_KEY, response.data.role || "");

  return response.data;
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY));
}
