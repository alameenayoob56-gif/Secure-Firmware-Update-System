import { useEffect, useState } from "react";
import { getBackendHealth } from "../services/system";
import "../styles/apiIntegration.css";

function ApiIntegrationPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkBackendHealth() {
    try {
      setLoading(true);
      setError("");

      const data = await getBackendHealth();
      setHealth(data);
    } catch (requestError) {
      setHealth(null);
      setError(
        requestError.response?.data?.message ||
          "Unable to connect to the backend API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkBackendHealth();
  }, []);

  function formatTimestamp(timestamp) {
    if (!timestamp) return "Not available";
    return new Date(timestamp).toLocaleString();
  }

  const isHealthy = health?.status === "healthy";

  return (
    <div className="api-integration-page">
      <div className="page-heading">
        <div>
          <h1>API Integration</h1>
          <p>Monitor the connection between the frontend and backend API.</p>
        </div>

        <button
          className="refresh-api-button"
          onClick={checkBackendHealth}
        >
          Check Connection
        </button>
      </div>

      {loading && (
        <div className="api-message loading-message">
          Checking backend health...
        </div>
      )}

      {error && (
        <div className="api-message error-message">
          {error}
        </div>
      )}

      {!loading && !error && health && (
        <section className="health-status-card">
          <div>
            <span className="health-label">BACKEND STATUS</span>
            <h2 className={isHealthy ? "healthy-text" : "unhealthy-text"}>
              {isHealthy ? "● Backend Healthy" : "● Backend Unhealthy"}
            </h2>
          </div>

          <div className="health-details">
            <p>
              <span>Database</span>
              <strong>{health.database}</strong>
            </p>

            <p>
              <span>Backend Version</span>
              <strong>{health.version}</strong>
            </p>

            <p>
              <span>Last Checked</span>
              <strong>{formatTimestamp(health.timestamp)}</strong>
            </p>
          </div>
        </section>
      )}

      <section className="api-info-panel">
        <h2>API Service Layer</h2>
        <p>
          The frontend uses centralized service files instead of calling API
          endpoints directly from components.
        </p>

        <div className="endpoint-list">
          <div className="endpoint-row">
            <span className="method get">GET</span>
            <code>/health</code>
            <span>Backend and database health status</span>
          </div>

          <div className="endpoint-row">
            <span className="method post">POST</span>
            <code>/firmware/upload</code>
            <span>Secure firmware upload</span>
          </div>

          <div className="endpoint-row">
            <span className="method get">GET</span>
            <code>/devices/</code>
            <span>Registered device list</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ApiIntegrationPage;