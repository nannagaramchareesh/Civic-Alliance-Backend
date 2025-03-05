import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
const Dashboard = () => {
    const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/dashboard-stats`, {
                headers: { "auth-token": localStorage.getItem('token') }  // Fixed the header syntax
            });
            if (response.data.success) {
                setStats(response.data.stats);
                setRecentActivity(response.data.recentActivity);
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return (
        <div className="p-6">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold">Pending Requests</h3>
                    <p className="text-2xl">{stats.pendingCount}</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold">Approved Requests</h3>
                    <p className="text-2xl">{stats.approvedCount}</p>
                </div>
                <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold">Rejected Requests</h3>
                    <p className="text-2xl">{stats.rejectedCount}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <ul>
                    {recentActivity.length > 0 ? (
                        recentActivity.map((user, index) => (
                            <li key={index} className="border-b py-2">
                                <span className={user.status === "Approved" ? "text-green-500" : "text-red-500"}>
                                    {user.status === "Approved" ? "✅ Approved" : "❌ Rejected"}
                                </span>
                                <span className="ml-2">{user.name} ({user.email})</span>
                            </li>
                        ))
                    ) : (
                        <p>No recent activity</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
