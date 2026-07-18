import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UploadFirmwarePage from "./pages/UploadFirmwarePage";
import DevicesPage from "./pages/DevicesPage";
import FirmwareHistoryPage from "./pages/FirmwareHistoryPage";
import ApiIntegrationPage from "./pages/ApiIntegrationPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadFirmwarePage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/firmware-history" element={<FirmwareHistoryPage />} />
            <Route path="/api-integration" element={<ApiIntegrationPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;