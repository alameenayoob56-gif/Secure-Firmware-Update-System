import api from "./api";

export async function deployFirmware(deviceId, firmwareId) {
  const response = await api.post("/deployment/deploy", {
    device_id: deviceId,
    firmware_id: firmwareId,
  });

  return response.data;
}

export async function getDeploymentHistory() {
  const response = await api.get("/deployment/history");
  return response.data;
}

export async function getDeploymentStatus() {
  const response = await api.get("/deployment/status");
  return response.data;
}

export async function getDeploymentsByStatus(status) {
  const response = await api.get(
    `/deployment/status/${encodeURIComponent(status)}`
  );

  return response.data;
}

export async function rollbackDeployment(deploymentId) {
  const response = await api.post("/deployment/rollback", {
    deployment_id: deploymentId,
  });

  return response.data;
}