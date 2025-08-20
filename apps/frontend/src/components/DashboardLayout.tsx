import React, { useState } from "react";
import Header from "./Header";
import SidebarLayout from "./SidebarLayout";
import { XIcon } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen relative">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden overlay-transition"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed md:relative z-40 w-64 bg-white border-r border-gray-200 flex flex-col h-full sidebar-transition ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="md:hidden p-4 flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <XIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <SidebarLayout />
        </aside>

        <main className="flex-1 overflow-auto bg-gray-50 pt-16 md:pt-30 p-6">
          {/* Show AgroLink Home Page text only when on dashboard root */}
          {location.pathname === "/dashboard" && (
            <div className="max-w-3xl mx-auto text-center mt-10">
              <h1 className="text-3xl font-bold text-green-700 mb-4">
                🌱 Welcome to AgroLink
              </h1>
              <p className="text-gray-600 text-lg">
                AgroLink is your smart agricultural assistant.  
                We connect farmers, buyers, and experts in one platform 
                to improve productivity, decision-making, and market access.
              </p>
              <p className="text-gray-600 text-lg mt-3">
                Explore weather predictions, crop recommendations, 
                and trading opportunities – all in one place.
              </p>
            </div>
          )}

          {/* Render child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
