import { useEffect, useState } from "react";
import {
  getDeploymentHistory,
  getDeploymentStatus,
  rollbackDeployment,
} from "../services/deployment";
import "../styles/deployment.css";

function DeploymentPage() {
  const [deployments, setDeployments] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDeployments() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [history, status] = await Promise.all([
        getDeploymentHistory(),
        getDeploymentStatus(),
      ]);

      setDeployments(Array.isArray(history) ? history : []);
      setStatusData(status);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to load deployment data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeployments();
  }, []);

  async function handleRollback(deploymentId) {
    const confirmed = window.confirm(
      `Are you sure you want to rollback deployment #${deploymentId}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await rollbackDeployment(deploymentId);

      setMessage(
        response?.message || "Deployment rollback completed successfully."
      );

      await loadDeployments();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.detail ||
          requestError.message ||
          "Rollback failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleString();
  }

  function getStatusClass(status) {
    return (status || "Unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  return (
    <div className="deployment-page">
      <div className="page-heading">
        <div>
          <h1>Deployments</h1>
          <p>
            Monitor firmware deployment activity and manage deployment
            rollbacks.
          </p>
        </div>

        <button
          type="button"
          className="refresh-deployments-button"
          onClick={loadDeployments}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="deployment-message error-message">
          {error}
        </div>
      )}

      {message && (
        <div className="deployment-message success-message">
          {message}
        </div>
      )}

      <section className="deployment-summary">
        <div>
          <span>Total Deployments</span>
          <strong>{deployments.length}</strong>
        </div>

        <div>
          <span>Started</span>
          <strong>
            {statusData?.started ??
              deployments.filter((item) => item.status === "Started").length}
          </strong>
        </div>

        <div>
          <span>Completed</span>
          <strong className="deployment-success-number">
            {statusData?.completed ??
              deployments.filter((item) => item.status === "Completed").length}
          </strong>
        </div>

        <div>
          <span>Failed</span>
          <strong className="deployment-failed-number">
            {statusData?.failed ??
              deployments.filter((item) => item.status === "Failed").length}
          </strong>
        </div>
      </section>

      <section className="deployments-panel">
        <div className="deployments-panel-heading">
          <div>
            <h2>Deployment History</h2>
            <span>
              {deployments.length} deployment record(s)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="deployment-message loading-message">
            Loading deployment history...
          </div>
        ) : (
          <div className="table-container">
            <table className="deployments-table">
              <thead>
                <tr>
                  <th>Deployment ID</th>
                  <th>Device ID</th>
                  <th>Firmware ID</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {deployments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-deployments">
                      No deployment records found.
                    </td>
                  </tr>
                ) : (
                  deployments.map((deployment) => (
                    <tr key={deployment.deployment_id}>
                      <td>{deployment.deployment_id}</td>
                      <td>{deployment.device_id}</td>
                      <td>{deployment.firmware_id}</td>
                      <td>
                        <span
                          className={`deployment-status ${getStatusClass(
                            deployment.status
                          )}`}
                        >
                          {deployment.status || "Unknown"}
                        </span>
                      </td>
                      <td>{formatDate(deployment.started_at)}</td>
                      <td>{formatDate(deployment.completed_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="rollback-button"
                          disabled={
                            actionLoading ||
                            deployment.status === "Rolled Back"
                          }
                          onClick={() =>
                            handleRollback(deployment.deployment_id)
                          }
                        >
                          {deployment.status === "Rolled Back"
                            ? "Rolled Back"
                            : "Rollback"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DeploymentPage;