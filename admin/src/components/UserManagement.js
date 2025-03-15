import React, { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  // Fetch Users from Backend
  const fetchUsers = async () => {
    console.log("Hit")
    try {
      const response = await axios.get(`${backendUrl}/api/admin/getallusers`);
      console.log(response.data)
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
    fetchUsers()
  }, [])
  // Handle role change
  // const handleRoleChange = (id, newRole) => {
  //   setUsers(users.map(user => 
  //     user.id === id ? { ...user, role: newRole } : user
  //   ));
  // };

  const handleDelete = async () => {
    const response = await axios.delete(`${backendUrl}/api/admin/deleteUsers`, { headers: { "auth-token": localStorage.getItem('token') } })
    if (response.data.success) {
      toast.success(response.data.message)
    }
    else {
      toast.error(response.data.message)
    }
  }

  // Deactivate User (Set Status to Rejected)
  const handleDeactivate = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/changeStatus`, {
        userId: id,
        status: "Rejected",
      });

      if (response.data.success) {
        toast.success("User deactivated successfully!");
        fetchUsers();
      } else {
        toast.error("Failed to deactivate user");
      }
    } catch (error) {
      toast.error("Error deactivating user");
    }
  };

  //hadle activate
  const handleActivate = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/changeStatus`, {
        userId: id,
        status: "Approved",
      });

      if (response.data.success) {
        toast.success("User activated successfully!");
        fetchUsers();
      } else {
        toast.error("Failed to activate user");
      }
    } catch (error) {
      toast.error("Error activating user");
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">User Management</h2>

      <table className="w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Department</th>
            <th className="py-2 px-4 border-b text-left">Role</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.department}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4 text-center">
                {/* <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2 hover:bg-blue-600 transition"
                  onClick={() => handleRoleChange(user.id, "Admin")}
                >
                  Make Admin
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600 transition"
                  onClick={() => handleRoleChange(user.id, "User")}
                >
                  Make User
                </button> */}
                {/* {["Approved", "Rejected"].includes(user.status) && (
                  <>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                      onClick={() => handleDeactivate(user._id)}
                    >
                      Deactivate
                    </button>

                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition ml-2"
                      onClick={() => handleActivate(user._id)}
                    >
                      Activate
                    </button>
                  </>
                )} */}
                {["Approved", "Rejected"].includes(user.status) && (
                  <>
                    {user.status === "Approved" && (
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                        onClick={() => handleDeactivate(user._id)}
                      >
                        Deactivate
                      </button>
                    )}

                    {user.status === "Rejected" && (
                      <button
                        className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition ml-2"
                        onClick={() => handleActivate(user._id)}
                      >
                        Activate
                      </button>
                    )}
                  </>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className='w-full mt-10' onClick={handleDelete}>Delete All Users</Button>
    </div>
  );
};

export default UserManagement;
