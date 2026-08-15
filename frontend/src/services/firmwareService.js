import api from "./api";

export async function uploadFirmware(
  { firmwareFile, firmwareName, firmwareVersion },
  onProgress
) {
  const formData = new FormData();

  formData.append("firmware", firmwareFile);
  formData.append("version", firmwareVersion);
  formData.append("firmware_name", firmwareName);

  const response = await api.post("/firmware/upload", formData, {
    onUploadProgress: (event) => {
      if (!event.total) return;

      const percentage = Math.round(
        (event.loaded * 100) / event.total
      );

      onProgress(percentage);
    },
  });

  return response.data;
}

export async function getFirmwareHistory() {
  const response = await api.get("/firmware/history");
  return response.data;
}

export async function getLatestFirmware() {
  const response = await api.get("/firmware/latest");
  return response.data;
}

export async function verifyFirmware(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/firmware/verify", formData);
  return response.data;
}

export async function verifyFirmwareSignature(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/firmware/verify-signature",
    formData
  );

  return response.data;
}

export async function decryptFirmware(filename) {
  const formData = new FormData();
  formData.append("filename", filename);

  const response = await api.post("/firmware/decrypt", formData);
  return response.data;
}

export async function deployFirmware(version) {
  const response = await api.post("/firmware/deploy", {
    version,
  });

  return response.data;
}

export async function rollbackFirmware(version) {
  const formData = new FormData();
  formData.append("version", version);

  const response = await api.post("/firmware/rollback", formData);
  return response.data;
}

export async function downloadFirmware(firmwareId) {
  const response = await api.get(
    `/firmware/download/${firmwareId}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
}

export async function deleteFirmware(firmwareId) {
  const response = await api.delete(`/firmware/${firmwareId}`);
  return response.data;
}