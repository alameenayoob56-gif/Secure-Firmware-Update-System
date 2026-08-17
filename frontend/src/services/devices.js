import api from "./api";

export async function getDevices() {
  const response = await api.get("/devices/");
  return response.data;
}

export async function registerDevice(device) {
  const response = await api.post("/devices/register", device);
  return response.data;
}

export async function assignFirmwareToDevice(
  serialNumber,
  firmwareVersion
) {
  const response = await api.post("/devices/assign-firmware", {
    serial_number: serialNumber,
    firmware_version: firmwareVersion,
  });

  return response.data;
}

export async function updateDeviceStatus(serialNumber, status) {
  const response = await api.post("/devices/update-status", {
    serial_number: serialNumber,
    status,
  });

  return response.data;
}

export async function searchDeviceBySerial(serialNumber) {
  const response = await api.get(
    `/devices/search/serial/${encodeURIComponent(serialNumber)}`
  );

  return response.data;
}

export async function getDevicesByStatus(status) {
  const response = await api.get(
    `/devices/status/${encodeURIComponent(status)}`
  );

  return response.data;
}

export async function getDevicesByFirmware(version) {
  const response = await api.get(
    `/devices/firmware/${encodeURIComponent(version)}`
  );

  return response.data;
}

export async function getDeviceById(deviceId) {
  const response = await api.get(`/devices/${deviceId}`);
  return response.data;
}

export async function updateDevice(deviceId, device) {
  const response = await api.put(`/devices/${deviceId}`, device);
  return response.data;
}

export async function deleteDevice(deviceId) {
  const response = await api.delete(`/devices/${deviceId}`);
  return response.data;
}