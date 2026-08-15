import api from "./api";

export async function getDeploymentStats() {
  const response = await api.get("/analytics/deployment-stats");
  return response.data;
}

export async function getFirmwareDistribution() {
  const response = await api.get("/analytics/firmware-distribution");
  return response.data;
}