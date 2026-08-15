import { useEffect, useState } from "react";
import { getDevices } from "../services/devices";
import {
  getFirmwareHistory,
} from "../services/firmwareService";
import {
  getDeploymentStats,
  getFirmwareDistribution,
} from "../services/analytics";
import "../styles/dashboard.css";

function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [deploymentStats, setDeploymentStats] = useState({
    total_deployments: 0,
    started: 0,
    completed: 0,
    failed: 0,
  });
  const [firmwareHistory, setFirmwareHistory] = useState([]);
  const [firmwareDistribution, setFirmwareDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        devicesData,
        deploymentStatsData,
        firmwareHistoryData,
        firmwareDistributionData,
      ] = await Promise.all([
        getDevices(),
        getDeploymentStats(),
        getFirmwareHistory(),
        getFirmwareDistribution(),
      ]);

      setDevices(devicesData);
      setDeploymentStats(deploymentStatsData);
      setFirmwareHistory(firmwareHistoryData);
      setFirmwareDistribution(firmwareDistributionData);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard data. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";
    return new Date(dateValue).toLocaleDateString();
  }

  const latestFirmware =
    firmwareHistory.find((firmware) => firmware.is_active) ||
    firmwareHistory[0];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor devices, firmware releases, and deployment activity.</p>
        </div>

        <button className="refresh-button" onClick={loadDashboard}>
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="dashboard-message loading-message">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="dashboard-message error-message">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-title">Registered Devices</p>
          <h2>{devices.length}</h2>
          <span className="stat-info">All managed IoT devices</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Total Deployments</p>
          <h2>{deploymentStats.total_deployments}</h2>
          <span className="stat-info">Firmware deployment records</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Completed Deployments</p>
          <h2 className="success-number">
            {deploymentStats.completed}
          </h2>
          <span className="stat-success">Deployment successful</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Failed Deployments</p>
          <h2 className="alert-number">
            {deploymentStats.failed}
          </h2>
          <span className="stat-danger">Requires attention</span>
        </div>
      </section>

      <section className="dashboard-data-grid">
        <div className="dashboard-section">
          <div className="section-heading">
            <h2>Latest Firmware</h2>
          </div>

          {latestFirmware ? (
            <div className="latest-firmware-details">
              <p>
                <span>Firmware Name</span>
                {latestFirmware.firmware_name}
              </p>

              <p>
                <span>Version</span>
                {latestFirmware.version}
              </p>

              <p>
                <span>Status</span>
                {latestFirmware.deployment_status || "Unknown"}
              </p>

              <p>
                <span>Release Date</span>
                {formatDate(latestFirmware.release_date)}
              </p>
            </div>
          ) : (
            <p className="empty-dashboard">No firmware releases found.</p>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <h2>Firmware Distribution</h2>
          </div>

          {firmwareDistribution.length > 0 ? (
            <div className="distribution-list">
              {firmwareDistribution.map((item) => (
                <div className="distribution-row" key={item.version}>
                  <span>{item.version || "No version assigned"}</span>
                  <strong>{item.devices} device(s)</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-dashboard">No device distribution data found.</p>
          )}
        </div>
      </section>

      <section className="dashboard-section recent-history-section">
        <div className="section-heading">
          <h2>Recent Firmware Releases</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Firmware Name</th>
                <th>Version</th>
                <th>Release Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {firmwareHistory.slice(0, 5).map((firmware) => (
                <tr key={firmware.id}>
                  <td>{firmware.firmware_name}</td>
                  <td>{firmware.version}</td>
                  <td>{formatDate(firmware.release_date)}</td>
                  <td>{firmware.deployment_status || "Unknown"}</td>
                </tr>
              ))}

              {!loading && !error && firmwareHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-dashboard">
                    No firmware history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;