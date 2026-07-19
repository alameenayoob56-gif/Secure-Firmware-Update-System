import "../styles/dashboard.css";

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor firmware updates and IoT device security status.</p>
        </div>

        <button className="refresh-button">Refresh Data</button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-title">Registered Devices</p>
          <h2>24</h2>
          <span className="stat-info">Total IoT devices</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Active Devices</p>
          <h2>21</h2>
          <span className="stat-success">Devices online</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Latest Firmware</p>
          <h2>v1.2.0</h2>
          <span className="stat-info">Build 42</span>
        </div>

        <div className="stat-card">
          <p className="stat-title">Security Alerts</p>
          <h2 className="alert-number">2</h2>
          <span className="stat-danger">Needs attention</span>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Recent Firmware Updates</h2>
          <button className="text-button">View History</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Firmware Version</th>
                <th>Build Number</th>
                <th>Uploaded Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>v1.2.0</td>
                <td>42</td>
                <td>18 July 2026</td>
                <td>
                  <span className="status-badge published">Published</span>
                </td>
              </tr>

              <tr>
                <td>v1.1.5</td>
                <td>41</td>
                <td>10 July 2026</td>
                <td>
                  <span className="status-badge published">Published</span>
                </td>
              </tr>

              <tr>
                <td>v1.1.0</td>
                <td>40</td>
                <td>02 July 2026</td>
                <td>
                  <span className="status-badge retired">Retired</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;