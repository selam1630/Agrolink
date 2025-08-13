import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  PackageIcon,
  PlusIcon,
  ShoppingCartIcon,
  InfoIcon,
  ActivityIcon,
  NewspaperIcon,
  CalendarIcon,
  LeafIcon,
  CloudSunIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOut as LogOutIcon,
} from "lucide-react";

const SidebarLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isLoggedIn = false;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-full">
      {!isLoggedIn && (
        <div className="flex flex-col gap-2 p-4 border-b border-gray-200 md:hidden">
          <Link
            to="/sign-in"
            className="flex items-center justify-center w-full px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="flex items-center justify-center w-full px-4 py-2 bg-yellow-400 text-green-900 font-medium rounded-md hover:bg-yellow-500 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}

      <nav className="flex flex-col mt-4 space-y-1 p-2">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/dashboard")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          {t("nav.home")}
        </Link>

        <Link
          to="/create-product"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/create-product")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          {t("nav.createProduct")}
        </Link>

        <Link
          to="/marketplace"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/marketplace")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          {t("nav.marketplace")}
          <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            24
          </span>
        </Link>

        <Link
          to="/services"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/services")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <LeafIcon className="w-5 h-5" />
          {t("nav.services")}
        </Link>

        <Link
          to="/disease-detection"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/disease-detection")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <ActivityIcon className="w-5 h-5" />
          Disease Detection
        </Link>

        <Link
          to="/news"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/news")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <NewspaperIcon className="w-5 h-5" />
          News
        </Link>

        <Link
          to="/products"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/products")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <PackageIcon className="w-5 h-5" />
          Products
        </Link>

        <Link
          to="/weather-detector"
          className={`flex md:hidden items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/weather-detector")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <CloudSunIcon className="w-5 h-5" />
          Weather
        </Link>

        <Link
          to="/calendar"
          className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
            isActive("/calendar")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </Link>

        <Link
          to="/about"
          className={`flex items-center gap-3 px-4 py-3 rounded mt-6 transition-colors ${
            isActive("/about")
              ? "bg-green-100 text-green-900"
              : "text-green-700 hover:bg-green-50 hover:text-green-900"
          }`}
        >
          <InfoIcon className="w-5 h-5" />
          {t("nav.aboutUs")}
        </Link>

        <Link
          to="/settings"
          className="flex md:hidden items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <SettingsIcon className="w-5 h-5" />
          Settings
        </Link>
      </nav>

      <div className="mt-auto p-2 space-y-1 border-t border-gray-200">
        <Link
          to="/help"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <HelpCircleIcon className="w-5 h-5" />
          Help Center
        </Link>
        {isLoggedIn && (
          <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <LogOutIcon className="w-5 h-5" />
            Logout
          </button>
        )}
      </div>

      <div className="p-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 AgroLink - Farm Management System
      </div>
    </div>
  );
};

export default SidebarLayout;
