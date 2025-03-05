import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <nav className="space-y-4">
        <Link
          to="/panel/dashboard"
          className="block py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Dashboard
        </Link>
        <Link
          to="/panel/pending-requests"
          className="block py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Pending Requests
        </Link>
        <Link
          to="/panel/user-management"
          className="block py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          User Management
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
