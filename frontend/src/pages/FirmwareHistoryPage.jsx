import { useEffect, useState } from "react";
import {
  getFirmwareHistory,
  verifyFirmware,
  verifyFirmwareSignature,
  downloadFirmware,
  deleteFirmware,
  deployFirmware,
  rollbackFirmware,
} from "../services/firmwareService";
import "../styles/firmwareHistory.css";

function FirmwareHistoryPage() {
  const [firmwareVersions, setFirmwareVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFirmware, setSelectedFirmware] = useState(null);

  async function loadFirmwareHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getFirmwareHistory();

setFirmwareVersions(
  Array.isArray(data) ? data : []
);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to load firmware history. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFirmwareHistory();
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleDateString();
  }

  function getStatusClass(status) {
    return (status || "Unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function handleVerify() {
    if (!selectedFile) {
      showMessage("Please select a firmware .bin file first.", "error");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      const response = await verifyFirmware(selectedFile);

      showMessage(
        response.message || "Firmware verification completed successfully.",
        "success"
      );
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Firmware verification failed.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVerifySignature() {
    if (!selectedFile) {
      showMessage("Please select a firmware .bin file first.", "error");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      const response = await verifyFirmwareSignature(selectedFile);

      showMessage(
        response.message ||
          "Firmware signature verification completed successfully.",
        "success"
      );
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Firmware signature verification failed.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload(firmware) {
    try {
      setActionLoading(true);
      setMessage("");

      const blob = await downloadFirmware(firmware.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${firmware.firmware_name || "firmware"}-${
        firmware.version || "download"
      }.bin`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showMessage("Firmware download started.", "success");
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to download firmware.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(firmware) {
    const confirmed = window.confirm(
      `Delete firmware "${firmware.firmware_name}" version ${firmware.version}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await deleteFirmware(firmware.id);

      showMessage(
        response.message || "Firmware deleted successfully.",
        "success"
      );

      await loadFirmwareHistory();
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to delete firmware.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeploy(firmware) {
    const confirmed = window.confirm(
      `Deploy firmware version ${firmware.version}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await deployFirmware(firmware.version);

      showMessage(
        response.message || "Firmware deployment started successfully.",
        "success"
      );

      await loadFirmwareHistory();
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Firmware deployment failed.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRollback(firmware) {
    const confirmed = window.confirm(
      `Rollback firmware version ${firmware.version}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await rollbackFirmware(firmware.version);

      showMessage(
        response.message || "Firmware rollback completed successfully.",
        "success"
      );

      await loadFirmwareHistory();
    } catch (requestError) {
      showMessage(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Firmware rollback failed.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  const latestFirmware =
    firmwareVersions.find((firmware) => firmware.is_active) ||
    firmwareVersions[0];

  return (
    <div className="firmware-history-page">
      <div className="page-heading">
        <div>
          <h1>Firmware History</h1>
          <p>Review uploaded firmware releases and deployment status.</p>
        </div>
      </div>

      {message && (
        <div className={`history-message ${messageType}`}>
          {message}
        </div>
      )}

      {error && (
        <div className="history-message error-message">
          {error}
        </div>
      )}

      {!loading && !error && latestFirmware && (
        <section className="latest-release-card">
          <div>
            <span className="latest-label">LATEST FIRMWARE RELEASE</span>
            <h2>{latestFirmware.version}</h2>
            <p>
              {latestFirmware.firmware_name} · Released{" "}
              {formatDate(latestFirmware.release_date)}
            </p>
          </div>

          <span className="signature-verified">
            {latestFirmware.is_active
              ? "● Active"
              : "● Latest Upload"}
          </span>
        </section>
      )}

      <section className="firmware-actions-panel">
        <h2>Firmware Verification</h2>

        <p>
          Select a firmware binary to verify its integrity or digital
          signature.
        </p>

        <div className="verification-controls">
          <input
            type="file"
            accept=".bin,application/octet-stream"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] || null)
            }
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={actionLoading}
          >
            Verify Firmware
          </button>

          <button
            type="button"
            onClick={handleVerifySignature}
            disabled={actionLoading}
          >
            Verify Signature
          </button>
        </div>

        {selectedFile && (
          <span className="selected-file">
            Selected: {selectedFile.name}
          </span>
        )}
      </section>

      <section className="firmware-history-panel">
        <div className="history-panel-heading">
          <h2>Release Records</h2>
          <span>{firmwareVersions.length} firmware record(s)</span>
        </div>

        <div className="table-container">
          <table className="firmware-history-table">
            <thead>
              <tr>
                <th>Firmware Name</th>
                <th>Version</th>
                <th>Release Date</th>
                <th>Deployment Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !error &&
                firmwareVersions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-history">
                      No firmware records found.
                    </td>
                  </tr>
                )}

              {firmwareVersions.map((firmware) => (
                <tr key={firmware.id}>
                  <td>{firmware.firmware_name}</td>

                  <td className="version-cell">
                    {firmware.version}
                  </td>

                  <td>
                    {formatDate(firmware.release_date)}
                  </td>

                  <td>
                    <span
                      className={`firmware-status ${getStatusClass(
                        firmware.deployment_status
                      )}`}
                    >
                      {firmware.deployment_status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    {firmware.is_active ? (
                      <span className="active-tag">Active</span>
                    ) : (
                      "No"
                    )}
                  </td>

                  <td>
                    <div className="firmware-row-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFirmware(firmware);
                          handleDownload(firmware);
                        }}
                        disabled={actionLoading}
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeploy(firmware)}
                        disabled={actionLoading}
                      >
                        Deploy
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRollback(firmware)}
                        disabled={actionLoading}
                      >
                        Rollback
                      </button>

                      <button
                        type="button"
                        className="danger-action"
                        onClick={() => handleDelete(firmware)}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedFirmware && (
        <div className="selected-firmware-info">
          Selected firmware:{" "}
          <strong>
            {selectedFirmware.firmware_name}{" "}
            {selectedFirmware.version}
          </strong>
        </div>
      )}
    </div>
  );
}

export default FirmwareHistoryPage;