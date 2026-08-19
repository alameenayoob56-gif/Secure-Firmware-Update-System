import { useEffect, useState } from "react";
import { getDevices } from "../services/devices";
import { getDeploymentHistory } from "../services/deployment";
import { getFirmwareHistory } from "../services/firmwareService";
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
  const [deploymentHistory, setDeploymentHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // Normalize API response
  // -----------------------------

  function normalizeArray(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.firmware)) {
      return data.firmware;
    }

    if (Array.isArray(data?.firmware_history)) {
      return data.firmware_history;
    }

    if (Array.isArray(data?.devices)) {
      return data.devices;
    }

    if (Array.isArray(data?.deployments)) {
      return data.deployments;
    }

    if (Array.isArray(data?.history)) {
      return data.history;
    }

    return [];
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [


  devicesData,
  deploymentStatsData,
  firmwareHistoryData,
  firmwareDistributionData,
  deploymentHistoryData,
] = await Promise.all([
  getDevices(),
  getDeploymentStats(),
  getFirmwareHistory(),
  getFirmwareDistribution(),
  getDeploymentHistory(),
]);

setDevices(Array.isArray(devicesData) ? devicesData : []);
setDeploymentStats(
  deploymentStatsData && typeof deploymentStatsData === "object"
    ? deploymentStatsData
    : {
        total_deployments: 0,
        started: 0,
        completed: 0,
        failed: 0,
      }
);
setFirmwareHistory(
  Array.isArray(firmwareHistoryData) ? firmwareHistoryData : []
);
setFirmwareDistribution(
  Array.isArray(firmwareDistributionData)
    ? firmwareDistributionData
    : []
);
setDeploymentHistory(
  Array.isArray(deploymentHistoryData) ? deploymentHistoryData : []
);

        devicesData,
        deploymentStatsData,
        firmwareHistoryData,
        firmwareDistributionData,
        deploymentHistoryData,
      ] = await Promise.all([
        getDevices(),
        getDeploymentStats(),
        getFirmwareHistory(),
        getFirmwareDistribution(),
        getDeploymentHistory(),
      ]);

      console.log("Dashboard API responses:", {
        devicesData,
        deploymentStatsData,
        firmwareHistoryData,
        firmwareDistributionData,
        deploymentHistoryData,
      });

      // Devices
      setDevices(normalizeArray(devicesData));

      // Firmware history
      setFirmwareHistory(normalizeArray(firmwareHistoryData));

      // Firmware distribution
      setFirmwareDistribution(
        normalizeArray(firmwareDistributionData)
      );

      // Deployment history
      setDeploymentHistory(
        normalizeArray(deploymentHistoryData)
      );

      // Deployment statistics
      if (
        deploymentStatsData &&
        typeof deploymentStatsData === "object" &&
        !Array.isArray(deploymentStatsData)
      ) {
        setDeploymentStats({
          total_deployments:
            Number(deploymentStatsData.total_deployments) || 0,

          started:
            Number(deploymentStatsData.started) || 0,

          completed:
            Number(deploymentStatsData.completed) || 0,

          failed:
            Number(deploymentStatsData.failed) || 0,
        });
      } else {
        setDeploymentStats({
          total_deployments: 0,
          started: 0,
          completed: 0,
          failed: 0,
        });
      }




    } catch (requestError) {
      console.error("Dashboard loading error:", requestError);

      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load dashboard data. Check the backend connection."
      );

      // Always keep state as arrays
      setDevices([]);
      setFirmwareHistory([]);
      setFirmwareDistribution([]);
      setDeploymentHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString();
  }

  // Safety: these are ALWAYS arrays
  const safeDevices = Array.isArray(devices) ? devices : [];

  const safeFirmwareHistory = Array.isArray(firmwareHistory)
    ? firmwareHistory
    : [];

  const safeFirmwareDistribution = Array.isArray(
    firmwareDistribution
  )
    ? firmwareDistribution
    : [];

  const safeDeploymentHistory = Array.isArray(
    deploymentHistory
  )
    ? deploymentHistory
    : [];

  const latestFirmware =
    safeFirmwareHistory.find(
      (firmware) =>
        firmware &&
        firmware.is_active === true
    ) || safeFirmwareHistory[0];

  return (
    <div className="dashboard-page">

      {/* ---------------- HEADER ---------------- */}

      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            Monitor devices, firmware releases, and deployment
            activity.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* ---------------- MESSAGES ---------------- */}

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

      {/* ---------------- STATS ---------------- */}

      <section className="stats-grid">

        <div className="stat-card">
          <p className="stat-title">
            Registered Devices
          </p>

          <h2>{safeDevices.length}</h2>

          <span className="stat-info">
            All managed IoT devices
          </span>
        </div>

        <div className="stat-card">
          <p className="stat-title">
            Total Deployments
          </p>

          <h2>
            {deploymentStats.total_deployments}
          </h2>

          <span className="stat-info">
            Firmware deployment records
          </span>
        </div>

        <div className="stat-card">
          <p className="stat-title">
            Completed Deployments
          </p>

          <h2 className="success-number">
            {deploymentStats.completed}
          </h2>

          <span className="stat-success">
            Deployment successful
          </span>
        </div>

        <div className="stat-card">
          <p className="stat-title">
            Failed Deployments
          </p>

          <h2 className="alert-number">
            {deploymentStats.failed}
          </h2>

          <span className="stat-danger">
            Requires attention
          </span>
        </div>

      </section>

      {/* ---------------- LATEST / DISTRIBUTION ---------------- */}

      <section className="dashboard-data-grid">

        <div className="dashboard-section">

          <div className="section-heading">
            <h2>Latest Firmware</h2>
          </div>

          {latestFirmware ? (
            <div className="latest-firmware-details">

              <p>
                <span>Firmware Name</span>
                {latestFirmware.firmware_name ||
                  "Unknown"}
              </p>

              <p>
                <span>Version</span>
                {latestFirmware.version ||
                  "Unknown"}
              </p>

              <p>
                <span>Status</span>
                {latestFirmware.deployment_status ||
                  "Unknown"}
              </p>

              <p>
                <span>Release Date</span>
                {formatDate(
                  latestFirmware.release_date
                )}
              </p>

            </div>
          ) : (
            <p className="empty-dashboard">
              No firmware releases found.
            </p>
          )}

        </div>

        <div className="dashboard-section">

          <div className="section-heading">
            <h2>Firmware Distribution</h2>
          </div>

          {safeFirmwareDistribution.length > 0 ? (
            <div className="distribution-list">

              {safeFirmwareDistribution.map(
                (item, index) => (
                  <div
                    className="distribution-row"
                    key={
                      item?.version ||
                      `distribution-${index}`
                    }
                  >

                    <span>
                      {item?.version ||
                        "No version assigned"}
                    </span>

                    <strong>
                      {Number(item?.devices) || 0}{" "}
                      device(s)
                    </strong>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="empty-dashboard">
              No device distribution data found.
            </p>
          )}

        </div>

      </section>

      {/* ---------------- FIRMWARE HISTORY ---------------- */}

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

              {safeFirmwareHistory
                .slice(0, 5)
                .map((firmware, index) => (
                  <tr
                    key={
                      firmware?.id ||
                      `firmware-${index}`
                    }
                  >

                    <td>
                      {firmware?.firmware_name ||
                        "Unknown"}
                    </td>

                    <td>
                      {firmware?.version ||
                        "Unknown"}
                    </td>

                    <td>
                      {formatDate(
                        firmware?.release_date
                      )}
                    </td>

                    <td>
                      {firmware?.deployment_status ||
                        "Unknown"}
                    </td>

                  </tr>
                ))}

              {!loading &&
                !error &&
                safeFirmwareHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-dashboard"
                    >
                      No firmware history found.
                    </td>
                  </tr>
                )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ---------------- DEPLOYMENT HISTORY ---------------- */}

      <section className="dashboard-section recent-history-section">

        <div className="section-heading">
          <h2>Recent Deployments</h2>
        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Deployment ID</th>
                <th>Device ID</th>
                <th>Firmware ID</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>

            <tbody>

              {safeDeploymentHistory
                .slice(0, 5)
                .map((deployment, index) => (
                  <tr
                    key={
                      deployment?.deployment_id ||
                      deployment?.id ||
                      `deployment-${index}`
                    }
                  >

                    <td>
                      {deployment?.deployment_id ||
                        deployment?.id ||
                        "-"}
                    </td>

                    <td>
                      {deployment?.device_id || "-"}
                    </td>

                    <td>
                      {deployment?.firmware_id || "-"}
                    </td>

                    <td>
                      {deployment?.status ||
                        "Unknown"}
                    </td>

                    <td>
                      {formatDate(
                        deployment?.started_at
                      )}
                    </td>

                  </tr>
                ))}

              {!loading &&
                !error &&
                safeDeploymentHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-dashboard"
                    >
                      No deployment history found.
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