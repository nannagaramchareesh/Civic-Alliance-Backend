import React, { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  // Fetch Users from Backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/getallusers`);
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle User Status Change
  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/changeStatus`, {
        userId: id,
        status,
      });

      if (response.data.success) {
        toast.success(`User ${status==="Approved"?"Activated":"Deactivated"} successfully!`);
        fetchUsers();
      } else {
        if(status === "Approved"){
          toast.error("Error Activating the user");
        }
        else{
          toast.error("Error Deactivating the user");
        }
      }
    } catch (error) {
      toast.error(`Error ${status.toLowerCase()} user`);
    }
  };

  // Handle Delete All Users
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/deleteUsers`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error deleting users");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Management</h2>

      <table className="w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-3 px-4 border-b text-left">Name</th>
            <th className="py-3 px-4 border-b text-left">Department</th>
            <th className="py-3 px-4 border-b text-left">Role</th>
            <th className="py-3 px-4 border-b text-left">Status</th>
            <th className="py-3 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b">
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">{user.department}</td>
              <td className="py-3 px-4">{user.role}</td>
              <td
                className={`py-3 px-4 font-bold ${
                  user.status === "Approved" ? "text-green-500" : "text-red-500"
                }`}
              >
                {user.status}
              </td>
              <td className="py-3 px-4 text-center flex gap-2 justify-center">
                <button
                  className={`px-4 py-2 rounded-md text-white font-semibold transition ${
                    user.status === "Approved"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={() => handleStatusChange(user._id, "Approved")}
                  disabled={user.status === "Approved"}
                >
                  Activate
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white font-semibold transition ${
                    user.status === "Rejected"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  onClick={() => handleStatusChange(user._id, "Rejected")}
                  disabled={user.status === "Rejected"}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button className="w-full mt-10" onClick={handleDelete}>
        Delete All Users
      </Button>
    </div>
  );
};

export default UserManagement;
