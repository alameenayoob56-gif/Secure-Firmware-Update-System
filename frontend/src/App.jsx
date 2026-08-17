import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/auth";

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
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadFirmwarePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DevicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/firmware-history"
          element={
            <ProtectedRoute>
              <FirmwareHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/api-integration"
          element={
            <ProtectedRoute>
              <ApiIntegrationPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;