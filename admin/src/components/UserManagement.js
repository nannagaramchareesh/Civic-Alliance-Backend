import React, { useState } from "react";
import Button from "./Button";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
const UserManagement = () => {
  // Dummy user data
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", department: "Urban Planning", role: "Admin" },
    { id: 2, name: "Jane Smith", department: "Infrastructure", role: "User" },
    { id: 3, name: "Michael Johnson", department: "Water Supply", role: "User" },
  ]);

  // Handle role change
  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    ));
  };

  const handleDelete =async ()=>{
    const response = await axios.delete(`${backendUrl}/api/admin/deleteUsers`,{headers:{"auth-token":localStorage.getItem('token')}})
    if(response.data.success){
      toast.success(response.data.message)
    }
    else{
      toast.error(response.data.message)
    }
  }

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
            <tr key={user.id} className="border-b">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.department}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4 text-center">
                <button
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
                </button>
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
