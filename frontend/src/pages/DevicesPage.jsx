import { useEffect, useState } from "react";
import {
  getDevices,
  registerDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus,
  assignFirmwareToDevice,
} from "../services/devices";
import "../styles/devices.css";

function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    device_name: "",
    serial_number: "",
    model: "",
    firmware_version: "",
  });

  const [editForm, setEditForm] = useState({
    device_name: "",
    model: "",
    firmware_version: "",
    status: "",
  });

  const [statusForm, setStatusForm] = useState({
    status: "",
  });

  const [firmwareForm, setFirmwareForm] = useState({
    firmware_version: "",
  });

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const data = await getDevices();

      setDevices(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
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

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;

    setRegisterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleRegisterDevice(event) {
    event.preventDefault();

    clearMessages();

    if (
      !registerForm.device_name.trim() ||
      !registerForm.serial_number.trim() ||
      !registerForm.model.trim() ||
      !registerForm.firmware_version.trim()
    ) {
      setError("All device registration fields are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await registerDevice({
        device_name: registerForm.device_name.trim(),
        serial_number: registerForm.serial_number.trim(),
        model: registerForm.model.trim(),
        firmware_version: registerForm.firmware_version.trim(),
      });

      setSuccess(
        response?.message || "Device registered successfully."
      );

      setRegisterForm({
        device_name: "",
        serial_number: "",
        model: "",
        firmware_version: "",
      });

      setShowRegisterModal(false);

      await loadDevices();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to register the device."
      );
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(device) {
    clearMessages();

    setSelectedDevice(device);

    setEditForm({
      device_name: device.device_name || "",
      model: device.model || "",
      firmware_version: device.firmware_version || "",
      status: device.status || "",
    });

    setShowEditModal(true);
  }

  async function handleUpdateDevice(event) {
    event.preventDefault();

    clearMessages();

    if (
      !editForm.device_name.trim() ||
      !editForm.model.trim() ||
      !editForm.firmware_version.trim() ||
      !editForm.status.trim()
    ) {
      setError("All device update fields are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateDevice(selectedDevice.device_id, {
        device_name: editForm.device_name.trim(),
        model: editForm.model.trim(),
        firmware_version: editForm.firmware_version.trim(),
        status: editForm.status.trim(),
      });

      setSuccess(
        response?.message || "Device updated successfully."
      );

      setShowEditModal(false);
      setSelectedDevice(null);

      await loadDevices();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to update the device."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDevice(device) {
    clearMessages();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${device.device_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const response = await deleteDevice(device.device_id);

      setSuccess(
        response?.message || "Device deleted successfully."
      );

      await loadDevices();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to delete the device."
      );
    } finally {
      setSaving(false);
    }
  }

  function openStatusModal(device) {
    clearMessages();

    setSelectedDevice(device);

    setStatusForm({
      status: device.status || "",
    });

    setShowStatusModal(true);
  }

  async function handleUpdateStatus(event) {
    event.preventDefault();

    clearMessages();

    if (!statusForm.status.trim()) {
      setError("Device status is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateDeviceStatus(
        selectedDevice.serial_number,
        statusForm.status.trim()
      );

      setSuccess(
        response?.message || "Device status updated successfully."
      );

      setShowStatusModal(false);
      setSelectedDevice(null);

      await loadDevices();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to update device status."
      );
    } finally {
      setSaving(false);
    }
  }

  function openFirmwareModal(device) {
    clearMessages();

    setSelectedDevice(device);

    setFirmwareForm({
      firmware_version: device.firmware_version || "",
    });

    setShowFirmwareModal(true);
  }

  async function handleAssignFirmware(event) {
    event.preventDefault();

    clearMessages();

    if (!firmwareForm.firmware_version.trim()) {
      setError("Firmware version is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await assignFirmwareToDevice(
        selectedDevice.serial_number,
        firmwareForm.firmware_version.trim()
      );

      setSuccess(
        response?.message || "Firmware assigned successfully."
      );

      setShowFirmwareModal(false);
      setSelectedDevice(null);

      await loadDevices();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to assign firmware to the device."
      );
    } finally {
      setSaving(false);
    }
  }

  function getStatusCount(status) {
    return devices.filter(
      (device) =>
        (device.status || "").toLowerCase() === status.toLowerCase()
    ).length;
  }

  function getStatusClass(status) {
    return (status || "Unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString();
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredDevices = devices.filter((device) => {
    return (
      (device.device_name || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (device.serial_number || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (device.model || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (device.firmware_version || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });

  return (
    <div className="devices-page">
      <div className="page-heading">
        <div>
          <h1>Devices</h1>
          <p>
            Monitor registered IoT devices and firmware status.
          </p>
        </div>

        <button
          type="button"
          className="add-device-button"
          onClick={() => {
            clearMessages();
            setShowRegisterModal(true);
          }}
        >
          + Register Device
        </button>
      </div>

      {success && (
        <div className="device-message success-message">
          {success}
        </div>
      )}

      {error && (
        <div className="device-message error-message">
          {error}
        </div>
      )}

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

      <section className="devices-panel">
        <div className="devices-panel-heading">
          <h2>Registered Devices</h2>

          <div className="device-actions">
            <input
              type="search"
              placeholder="Search device, serial, model..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <button
              type="button"
              className="refresh-devices-button"
              onClick={loadDevices}
              disabled={loading || saving}
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !error &&
                filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-devices">
                      {searchTerm
                        ? "No devices match your search."
                        : "No devices found."}
                    </td>
                  </tr>
                )}

              {filteredDevices.map((device) => (
                <tr key={device.device_id}>
                  <td>{device.device_name}</td>

                  <td className="device-id">
                    {device.serial_number}
                  </td>

                  <td>{device.model}</td>

                  <td>{device.firmware_version}</td>

                  <td>
                    <span
                      className={`device-status ${getStatusClass(
                        device.status
                      )}`}
                    >
                      {device.status || "Unknown"}
                    </span>
                  </td>

                  <td>{formatDate(device.registered_at)}</td>

                  <td>
                    <div className="device-row-actions">
                      <button
                        type="button"
                        onClick={() => openEditModal(device)}
                        disabled={saving}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openStatusModal(device)}
                        disabled={saving}
                      >
                        Status
                      </button>

                      <button
                        type="button"
                        onClick={() => openFirmwareModal(device)}
                        disabled={saving}
                      >
                        Firmware
                      </button>

                      <button
                        type="button"
                        className="delete-device-button"
                        onClick={() =>
                          handleDeleteDevice(device)
                        }
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Register Device */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="device-modal">
            <div className="modal-header">
              <div>
                <h2>Register Device</h2>
                <p>Add a new IoT device to the system.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowRegisterModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterDevice}>
              <label>
                Device Name
                <input
                  name="device_name"
                  type="text"
                  value={registerForm.device_name}
                  onChange={handleRegisterChange}
                  placeholder="Example: Cargo Tracker 01"
                />
              </label>

              <label>
                Serial Number
                <input
                  name="serial_number"
                  type="text"
                  value={registerForm.serial_number}
                  onChange={handleRegisterChange}
                  placeholder="Example: CT-001234"
                />
              </label>

              <label>
                Model
                <input
                  name="model"
                  type="text"
                  value={registerForm.model}
                  onChange={handleRegisterChange}
                  placeholder="Example: ESP32"
                />
              </label>

              <label>
                Firmware Version
                <input
                  name="firmware_version"
                  type="text"
                  value={registerForm.firmware_version}
                  onChange={handleRegisterChange}
                  placeholder="Example: 1.0.0"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowRegisterModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Registering..." : "Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Device */}
      {showEditModal && selectedDevice && (
        <div className="modal-overlay">
          <div className="device-modal">
            <div className="modal-header">
              <div>
                <h2>Edit Device</h2>
                <p>
                  Update information for{" "}
                  {selectedDevice.device_name}.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateDevice}>
              <label>
                Device Name
                <input
                  name="device_name"
                  type="text"
                  value={editForm.device_name}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Model
                <input
                  name="model"
                  type="text"
                  value={editForm.model}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Firmware Version
                <input
                  name="firmware_version"
                  type="text"
                  value={editForm.firmware_version}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Status
                <input
                  name="status"
                  type="text"
                  value={editForm.status}
                  onChange={handleEditChange}
                  placeholder="Example: Updated"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status */}
      {showStatusModal && selectedDevice && (
        <div className="modal-overlay">
          <div className="device-modal">
            <div className="modal-header">
              <div>
                <h2>Update Device Status</h2>
                <p>
                  {selectedDevice.device_name} —{" "}
                  {selectedDevice.serial_number}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <label>
                Status
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm({
                      status: event.target.value,
                    })
                  }
                >
                  <option value="">Select status</option>
                  <option value="Updated">Updated</option>
                  <option value="Updating">Updating</option>
                  <option value="Failed">Failed</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Firmware */}
      {showFirmwareModal && selectedDevice && (
        <div className="modal-overlay">
          <div className="device-modal">
            <div className="modal-header">
              <div>
                <h2>Assign Firmware</h2>
                <p>
                  {selectedDevice.device_name} —{" "}
                  {selectedDevice.serial_number}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowFirmwareModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssignFirmware}>
              <label>
                Firmware Version
                <input
                  type="text"
                  value={firmwareForm.firmware_version}
                  onChange={(event) =>
                    setFirmwareForm({
                      firmware_version: event.target.value,
                    })
                  }
                  placeholder="Example: 1.2.0"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowFirmwareModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Assigning..." : "Assign Firmware"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevicesPage;