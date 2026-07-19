import "../styles/devices.css";

function DevicesPage() {
  const devices = [
    {
      id: "DEV-001",
      name: "Cargo Tracker - Bengaluru",
      firmware: "v1.2.0",
      status: "Online",
      lastSeen: "Just now",
    },
    {
      id: "DEV-002",
      name: "Cargo Tracker - Chennai",
      firmware: "v1.2.0",
      status: "Online",
      lastSeen: "2 minutes ago",
    },
    {
      id: "DEV-003",
      name: "Warehouse Sensor - Mumbai",
      firmware: "v1.1.5",
      status: "Update Pending",
      lastSeen: "8 minutes ago",
    },
    {
      id: "DEV-004",
      name: "Cargo Tracker - Delhi",
      firmware: "v1.1.0",
      status: "Offline",
      lastSeen: "1 hour ago",
    },
  ];

  return (
    <div className="devices-page">
      <div className="page-heading">
        <div>
          <h1>Devices</h1>
          <p>Monitor registered IoT devices and their firmware status.</p>
        </div>

        <button className="add-device-button">+ Register Device</button>
      </div>

      <section className="device-summary">
        <div>
          <span>Total Devices</span>
          <strong>24</strong>
        </div>

        <div>
          <span>Online</span>
          <strong className="online-text">21</strong>
        </div>

        <div>
          <span>Update Pending</span>
          <strong className="pending-text">2</strong>
        </div>

        <div>
          <span>Offline</span>
          <strong className="offline-text">1</strong>
        </div>
      </section>

      <section className="devices-panel">
        <div className="devices-panel-heading">
          <h2>Registered Devices</h2>
          <input
            type="search"
            placeholder="Search by device name or ID"
            aria-label="Search devices"
          />
        </div>

        <div className="table-container">
          <table className="devices-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Device ID</th>
                <th>Installed Firmware</th>
                <th>Status</th>
                <th>Last Seen</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.name}</td>
                  <td className="device-id">{device.id}</td>
                  <td>{device.firmware}</td>
                  <td>
                    <span
                      className={`device-status ${device.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {device.status}
                    </span>
                  </td>
                  <td>{device.lastSeen}</td>
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