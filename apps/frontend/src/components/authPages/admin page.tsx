import React from "react";
import { useNavigate } from "react-router-dom";
import agriIcon from "@/assets/images/agriIcon.png";

const AdminDashboard3: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100 p-4">
      <div className="relative bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg">
        <img
          src={agriIcon}
          alt="AgroTech Logo"
          className="absolute top-6 left-6 w-20 h-20 p-2"
        />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-700">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Choose an action to manage your farmers.
          </p>
        </div>

        <div className="space-y-6">
          {/* ✅ Goes to AdminDashboard2 */}
          <button
            onClick={() => navigate("/admin-dashboard2")}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
          >
            ➕ Create Farmer
          </button>
         <button
            onClick={() => navigate("/new-posting")}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
          >
            📝 New Posting
          </button>
          {/* ✅ Goes to Weather Detector */}
          <button
            onClick={() => navigate("/weather-detector")}
            className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-300"
          >
            📢 Send Alert
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard3;
