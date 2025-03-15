import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";

export const backendUrl = process.env.REACT_APP_BACKEND_URL;

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Admin Panel with Nested Routes */}
        <Route path="/panel/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
};

export default App;
