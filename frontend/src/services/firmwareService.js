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
    headers: {
      "Content-Type": "multipart/form-data",
    },
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