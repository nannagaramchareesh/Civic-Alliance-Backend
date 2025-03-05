import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PendingRequests from "../components/PendingRequests";
import UserManagement from "../components/UserManagement";
import Dashboard from "../components/Dashboard";

const AdminPanel = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          {/* Default route should go to dashboard */}
          <Route index element={<Navigate to="/panel/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pending-requests" element={<PendingRequests />} />
          <Route path="user-management" element={<UserManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
