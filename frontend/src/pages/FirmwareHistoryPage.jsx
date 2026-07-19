import "../styles/firmwareHistory.css";

function FirmwareHistoryPage() {
  const firmwareVersions = [
    {
      version: "v1.2.0",
      build: "42",
      hash: "6a2b4c8d91ef...90e1",
      date: "18 July 2026",
      status: "Published",
    },
    {
      version: "v1.1.5",
      build: "41",
      hash: "7c409d3a21be...1abd",
      date: "10 July 2026",
      status: "Published",
    },
    {
      version: "v1.1.0",
      build: "40",
      hash: "8f11b2c4d07a...94c2",
      date: "02 July 2026",
      status: "Retired",
    },
    {
      version: "v1.0.9",
      build: "39",
      hash: "2e80a5cd190f...30ba",
      date: "20 June 2026",
      status: "Retired",
    },
  ];

  return (
    <div className="firmware-history-page">
      <div className="page-heading">
        <div>
          <h1>Firmware History</h1>
          <p>Review signed firmware releases and their integrity records.</p>
        </div>

        <button className="history-upload-button">+ Upload Firmware</button>
      </div>

      <section className="latest-release-card">
        <div>
          <span className="latest-label">LATEST SIGNED RELEASE</span>
          <h2>v1.2.0</h2>
          <p>Build 42 · Published 18 July 2026</p>
        </div>

        <div className="signature-verified">
          ✓ Signature Verified
        </div>
      </section>

      <section className="firmware-history-panel">
        <div className="history-panel-heading">
          <h2>Release Records</h2>
          <span>All firmware files are SHA-256 verified.</span>
        </div>

        <div className="table-container">
          <table className="firmware-history-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Build</th>
                <th>SHA-256 Hash</th>
                <th>Published Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {firmwareVersions.map((firmware) => (
                <tr key={firmware.build}>
                  <td className="version-cell">{firmware.version}</td>
                  <td>{firmware.build}</td>
                  <td>
                    <code>{firmware.hash}</code>
                  </td>
                  <td>{firmware.date}</td>
                  <td>
                    <span
                      className={`firmware-status ${firmware.status.toLowerCase()}`}
                    >
                      {firmware.status}
                    </span>
                  </td>
                  <td>
                    <button className="manifest-button">View Manifest</button>
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