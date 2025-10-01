import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import agriIcon from "@/assets/images/agriIcon.png";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface AdminMetrics {
  totalFarmers: number;
  pendingPosts: number;
  alertsSent: number;
  activeMarkets: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;

      try {
        // Example API call to fetch admin metrics
        const response = await axios.get<AdminMetrics>(
          "http://localhost:5000/api/admin/metrics",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMetrics(response.data);
      } catch (err) {
        setError("Failed to load metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (loading) return <div className="p-6 text-center">Loading admin dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <img src={agriIcon} alt="AgroTech Logo" className="w-16 h-16 mr-4" />
        <h1 className="text-3xl font-bold text-green-700">Admin Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Farmers</h2>
          <div className="text-3xl font-bold text-gray-800">{metrics?.totalFarmers}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Pending Posts</h2>
          <div className="text-3xl font-bold text-gray-800">{metrics?.pendingPosts}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Alerts Sent</h2>
          <div className="text-3xl font-bold text-gray-800">{metrics?.alertsSent}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Active Markets</h2>
          <div className="text-3xl font-bold text-gray-800">{metrics?.activeMarkets}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin-dashboard2")}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
          >
            ➕ Create Farmer
          </button>
          <button
            onClick={() => navigate("/new-posting")}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
          >
            📝 New Posting
          </button>
          <button
            onClick={() => navigate("/weather-detector")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
          >
            📢 Send Alert
          </button>
          <button
            onClick={() => navigate("/manage-markets")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
          >
            📊 Manage Markets
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
