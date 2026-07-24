import api from "./api";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function uploadFirmware(formData, onProgress) {
  const apiEnabled =
    import.meta.env.VITE_ENABLE_FIRMWARE_API === "true";

  // Demo mode: used until the backend team confirms the final endpoint.
  if (!apiEnabled) {
    onProgress(25);
    await wait(400);

    onProgress(60);
    await wait(500);

    onProgress(100);
    await wait(400);

    return {
      message:
        "Firmware validated successfully. Backend upload is ready to be connected.",
    };
  }

  // Real API mode: enable only after the backend endpoint is confirmed.
  const response = await api.post(
    import.meta.env.VITE_FIRMWARE_UPLOAD_PATH,
    formData,
    {
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
    }
  );

  return response.data;
}