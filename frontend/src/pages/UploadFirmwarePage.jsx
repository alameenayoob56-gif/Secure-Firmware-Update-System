import { useState } from "react";
import { uploadFirmware } from "../services/firmwareService";
import "../styles/uploadFirmware.css";

function UploadFirmwarePage() {
  const [firmwareFile, setFirmwareFile] = useState(null);
  const [firmwareName, setFirmwareName] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function validateForm() {
    if (!firmwareFile) {
      return "Please choose a firmware .bin file.";
    }

    if (!firmwareFile.name.toLowerCase().endsWith(".bin")) {
      return "Only .bin firmware files are allowed.";
    }

    if (!firmwareName.trim()) {
      return "Firmware name is required.";
    }

    if (!firmwareVersion.trim()) {
      return "Firmware version is required.";
    }

    const versionPattern = /^\d+\.\d+\.\d+$/;

    if (!versionPattern.test(firmwareVersion)) {
      return "Version must use the format 1.0.0.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("firmware_file", firmwareFile);
    formData.append("firmware_name", firmwareName);
    formData.append("firmware_version", firmwareVersion);
    formData.append("release_notes", releaseNotes);

    try {
      setIsUploading(true);
      setProgress(0);
      setMessageType("progress");
      setMessage("Preparing secure firmware upload...");

      const response = await uploadFirmware(formData, setProgress);

      setMessageType("success");
      setMessage(
        response.message || "Firmware uploaded successfully."
      );
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.detail ||
          "Upload failed. Please try again."
      );
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="page-heading">
        <div>
          <h1>Upload Firmware</h1>
          <p>Submit a firmware binary for secure server-side validation and signing.</p>
        </div>
      </div>

      <section className="upload-panel">
        <h2>Firmware Release Details</h2>
        <p className="panel-description">
          Your browser sends the firmware file to the backend. The private signing
          key remains on the server.
        </p>

        <form className="firmware-form" onSubmit={handleSubmit}>
          <label>
            Firmware File <span className="required-mark">*</span>
            <input
              type="file"
              accept=".bin,application/octet-stream"
              onChange={(event) => setFirmwareFile(event.target.files[0])}
            />
            <span className="field-help">Only .bin firmware files are accepted.</span>
          </label>

          <label>
            Firmware Name <span className="required-mark">*</span>
            <input
              type="text"
              placeholder="Example: Cargo Tracker Firmware"
              value={firmwareName}
              onChange={(event) => setFirmwareName(event.target.value)}
            />
          </label>

          <label>
            Firmware Version <span className="required-mark">*</span>
            <input
              type="text"
              placeholder="Example: 1.3.0"
              value={firmwareVersion}
              onChange={(event) => setFirmwareVersion(event.target.value)}
            />
            <span className="field-help">Use numeric version format: 1.0.0</span>
          </label>

          <label>
            Release Notes
            <textarea
              rows="5"
              placeholder="Describe the fixes or improvements in this release."
              value={releaseNotes}
              onChange={(event) => setReleaseNotes(event.target.value)}
            />
          </label>

          {isUploading && (
            <div className="progress-section">
              <div className="progress-label">
                <span>Uploading firmware</span>
                <span>{progress}%</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`upload-message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="security-note">
            <strong>Security Notice:</strong> Hashing and digital signing occur
            only on the backend server.
          </div>

          <button
            type="submit"
            className="upload-button"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload for Signing"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default UploadFirmwarePage;