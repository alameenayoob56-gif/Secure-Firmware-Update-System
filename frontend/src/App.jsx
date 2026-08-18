import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/auth";

import DeploymentPage from "./pages/DeploymentPage";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UploadFirmwarePage from "./pages/UploadFirmwarePage";
import DevicesPage from "./pages/DevicesPage";
import FirmwareHistoryPage from "./pages/FirmwareHistoryPage";
import ApiIntegrationPage from "./pages/ApiIntegrationPage";

import "./App.css";

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadFirmwarePage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route
            path="firmware-history"
            element={<FirmwareHistoryPage />}
          />
          <Route
  path="/deployments"
  element={
    <ProtectedRoute>
      <DeploymentPage />
    </ProtectedRoute>
  }
/>
          <Route
            path="api-integration"
            element={<ApiIntegrationPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;