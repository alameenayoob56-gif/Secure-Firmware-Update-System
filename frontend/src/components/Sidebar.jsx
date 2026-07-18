import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Secure OTA</h2>
      <p>Firmware Management</p>

      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/upload">Upload Firmware</NavLink>
        <NavLink to="/devices">Devices</NavLink>
        <NavLink to="/firmware-history">Firmware History</NavLink>
        <NavLink to="/api-integration">API Integration</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;