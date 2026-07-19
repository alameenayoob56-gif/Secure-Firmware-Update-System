import "../styles/uploadFirmware.css";

function UploadFirmwarePage() {
  return (
    <div className="upload-page">
      <div className="page-heading">
        <div>
          <h1>Upload Firmware</h1>
          <p>Upload a firmware binary for secure server-side signing.</p>
        </div>
      </div>

      <section className="upload-panel">
        <h2>Firmware Release Details</h2>
        <p className="panel-description">
          The backend will validate, hash, and digitally sign the firmware file.
        </p>

        <form className="firmware-form">
          <label>
            Firmware File
            <input type="file" accept=".bin" />
            <span className="field-help">Only .bin firmware files are allowed.</span>
          </label>

          <div className="form-row">
            <label>
              Firmware Version
              <input type="text" placeholder="Example: 1.3.0" />
            </label>

            <label>
              Build Number
              <input type="number" placeholder="Example: 43" />
            </label>
          </div>

          <label>
            Release Notes
            <textarea
              rows="5"
              placeholder="Describe the changes included in this firmware release."
            />
          </label>

          <div className="security-note">
            <strong>Security Notice:</strong> The private signing key stays only on
            the backend server and is never exposed in this browser.
          </div>

          <button type="submit" className="upload-button">
            Upload for Signing
          </button>
        </form>
      </section>
    </div>
  );
}

export default UploadFirmwarePage;