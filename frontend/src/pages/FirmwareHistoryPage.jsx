import { useEffect, useState } from "react";
import { getFirmwareHistory } from "../services/firmwareService";
import "../styles/firmwareHistory.css";

function FirmwareHistoryPage() {
  const [firmwareVersions, setFirmwareVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFirmwareHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getFirmwareHistory();
        setFirmwareVersions(data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load firmware history. Check the backend connection."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFirmwareHistory();
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString();
  }

  function getStatusClass(status) {
    return (status || "Unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");
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

      {loading && (
        <div className="history-message loading-message">
          Loading firmware history...
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

          <span className="active-firmware-status">
            {latestFirmware.is_active ? "● Active" : "● Latest Upload"}
          </span>
        </section>
      )}

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
              </tr>
            </thead>

            <tbody>
              {!loading && !error && firmwareVersions.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-history">
                    No firmware records found.
                  </td>
                </tr>
              )}

              {firmwareVersions.map((firmware) => (
                <tr key={firmware.id}>
                  <td>{firmware.firmware_name}</td>
                  <td className="version-cell">{firmware.version}</td>
                  <td>{formatDate(firmware.release_date)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FirmwareHistoryPage;