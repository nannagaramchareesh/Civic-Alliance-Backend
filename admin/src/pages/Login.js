import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import Button from "../components/Button";
import axios from 'axios'
import {backendUrl} from '../App'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async(e)=>{
    e.preventDefault();
    try {
        const response = await axios.post(`${backendUrl}/api/admin/admin-login`, {email,password})
        if(response.data.success){
            localStorage.setItem('token',response.data.token)
            navigate('/panel')
        }
        else{
            toast.error(response.data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-8  rounded-2xl shadow-xl w-[450px] h-[350px]">
        <h2 className="text-3xl font-bold text-center mb-11 mr-3">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-2 pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 mb-2 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-2xl font-semibold">
            Login
          </Button>
        </form>

      </div>
    </div>
  );
}
