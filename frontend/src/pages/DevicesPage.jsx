import { useEffect, useState } from "react";
import { getDevices } from "../services/devices";
import "../styles/devices.css";

function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const data = await getDevices();
      setDevices(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load devices. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  function getStatusCount(status) {
    return devices.filter((device) => device.status === status).length;
  }

  function getStatusClass(status) {
    return (status || "Unknown").toLowerCase().replace(/\s+/g, "-");
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";
    return new Date(dateValue).toLocaleDateString();
  }

  const filteredDevices = devices.filter((device) => {
    const searchValue = searchTerm.toLowerCase();

    return (
      device.device_name.toLowerCase().includes(searchValue) ||
      device.serial_number.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="devices-page">
      <div className="page-heading">
        <div>
          <h1>Devices</h1>
          <p>Monitor registered IoT devices and firmware status.</p>
        </div>

        <button className="add-device-button">+ Register Device</button>
      </div>

      <section className="device-summary">
        <div>
          <span>Total Devices</span>
          <strong>{devices.length}</strong>
        </div>

        <div>
          <span>Updated</span>
          <strong className="updated-text">
            {getStatusCount("Updated")}
          </strong>
        </div>

        <div>
          <span>Updating</span>
          <strong className="updating-text">
            {getStatusCount("Updating")}
          </strong>
        </div>

        <div>
          <span>Failed</span>
          <strong className="failed-text">
            {getStatusCount("Failed")}
          </strong>
        </div>
      </section>

      {loading && (
        <div className="device-message loading-message">
          Loading devices...
        </div>
      )}

      {error && (
        <div className="device-message error-message">
          {error}
        </div>
      )}

      <section className="devices-panel">
        <div className="devices-panel-heading">
          <h2>Registered Devices</h2>

          <div className="device-actions">
            <input
              type="search"
              placeholder="Search by device name or serial number"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <button
              type="button"
              className="refresh-devices-button"
              onClick={loadDevices}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="devices-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Number</th>
                <th>Model</th>
                <th>Firmware</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {!loading && !error && filteredDevices.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-devices">
                    No devices found.
                  </td>
                </tr>
              )}

              {filteredDevices.map((device) => (
                <tr key={device.device_id}>
                  <td>{device.device_name}</td>
                  <td className="device-id">{device.serial_number}</td>
                  <td>{device.model}</td>
                  <td>{device.firmware_version}</td>
                  <td>
                    <span
                      className={`device-status ${getStatusClass(
                        device.status
                      )}`}
                    >
                      {device.status}
                    </span>
                  </td>
                  <td>{formatDate(device.registered_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DevicesPage;