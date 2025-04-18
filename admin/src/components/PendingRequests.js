import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import axios from 'axios';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null); // To track which user is being updated

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/pending-requests`, {
        headers: { "auth-token": localStorage.getItem('token') }
      });
      if (response.data.success) {
        setRequests(response.data.PendingRequests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      const response = await axios.post(`${backendUrl}/api/admin/update-status`, 
        { userId: id, status },
        { headers: { "auth-token": localStorage.getItem('token') } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
      await fetchRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Pending Signup Requests</h2>
      {requests.length > 0 ? (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Department</th>
              <th className="py-2 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.department}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    className="bg-green-500 text-white px-4 py-1 rounded-md mr-2 hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleAction(item._id, "Approved")}
                    disabled={actionLoading === item._id}
                  >
                    {actionLoading === item._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      "Approve"
                    )}
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleAction(item._id, "Rejected")}
                    disabled={actionLoading === item._id}
                  >
                    {actionLoading === item._id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      "Reject"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No pending requests.</p>
      )}
    </div>
  );
};

export default PendingRequests;
