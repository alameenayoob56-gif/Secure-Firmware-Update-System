import { useState } from "react";
import {
  uploadFirmware,
  verifyFirmware,
} from "../services/firmwareService";
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
  const [isVerifying, setIsVerifying] = useState(false);
const [verificationResult, setVerificationResult] = useState(null);

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

async function handleVerify() {
  if (!firmwareFile) {
    setMessageType("error");
    setMessage("Please choose a firmware .bin file first.");
    return;
  }

  if (!firmwareFile.name.toLowerCase().endsWith(".bin")) {
    setMessageType("error");
    setMessage("Only .bin firmware files are allowed.");
    return;
  }

  try {
    setIsVerifying(true);
    setMessage("");
    setVerificationResult(null);

    const result = await verifyFirmware(firmwareFile);

    setVerificationResult(result);
    setMessageType("success");
    setMessage(result?.message || "Firmware verification completed.");
  } catch (error) {
    setVerificationResult(null);
    setMessageType("error");
    setMessage(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Firmware verification failed."
    );
  } finally {
    setIsVerifying(false);
  }
}


  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

  

    try {
      setIsUploading(true);
      setProgress(0);
      setMessageType("progress");
      setMessage("Preparing secure firmware upload...");

    const response = await uploadFirmware(
  {
    firmwareFile,
    firmwareName,
    firmwareVersion,
  },
  setProgress
);
setVerificationResult(response);
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

         <div className="upload-actions">
  <button
    type="button"
    className="verify-button"
    onClick={handleVerify}
    disabled={isUploading || isVerifying}
  >
    {isVerifying ? "Verifying..." : "Verify Firmware"}
  </button>

  <button
    type="submit"
    className="upload-button"
    disabled={isUploading || isVerifying}
  >
    {isUploading ? "Uploading..." : "Upload for Signing"}
  </button>
  {verificationResult && (
  <div className="verification-result">
    <strong>Verification Result</strong>

    <pre>
      {JSON.stringify(verificationResult, null, 2)}
    </pre>
  </div>
)}
</div>
        </form>
      </section>
    </div>
  );
}

export default UploadFirmwarePage;