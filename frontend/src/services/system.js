import api from "./api";

export async function getBackendHealth() {
  const response = await api.get("/health");
  return response.data;
}