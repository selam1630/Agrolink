import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  LeafIcon,
  ActivityIcon,
  ShoppingCartIcon,
  CloudSunIcon,
  NewspaperIcon,
  TractorIcon,
  BookOpenIcon,
  HeartHandshakeIcon,
  WrenchIcon
} from "lucide-react";

// This component provides a beautifully designed and responsive Services page.
// It uses a consistent green color palette and a clean, card-based layout,
// with all text now being multilingual via the i18n library.

// Define a TypeScript interface for the service card data structure.
// This resolves the type-related errors.
interface ServiceCard {
  title: string;
  description: string;
}

const Services: React.FC = () => {
  // The useTranslation hook gives us access to the t() function for translations.
  const { t } = useTranslation();

  // Array of service icons to pair with the translated content.
  const serviceIcons = [
    <ActivityIcon className="w-10 h-10 text-green-600 mb-4" />,
    <ShoppingCartIcon className="w-10 h-10 text-green-600 mb-4" />,
    <CloudSunIcon className="w-10 h-10 text-green-600 mb-4" />,
    <WrenchIcon className="w-10 h-10 text-green-600 mb-4" />,
    <BookOpenIcon className="w-10 h-10 text-green-600 mb-4" />,
    <HeartHandshakeIcon className="w-10 h-10 text-green-600 mb-4" />,
  ];

  // We retrieve the services array from the translation file and explicitly
  // cast it as an array of ServiceCard objects to satisfy TypeScript.
  const serviceCards = t("servicesPage.serviceCards", { returnObjects: true }) as ServiceCard[];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-green-800 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700 opacity-80"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <LeafIcon className="w-16 h-16 mx-auto mb-4 text-green-300" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {t("servicesPage.hero.title")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-green-100">
            {t("servicesPage.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t("servicesPage.solutions.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t("servicesPage.solutions.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCards.map((service: ServiceCard, index: number) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
              >
                {/* Use the corresponding icon from the serviceIcons array */}
                {serviceIcons[index]}
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{service.title}</h3>
                <p className="mt-2 text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-green-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold">
            {t("servicesPage.cta.title")}
          </h2>
          <p className="mt-4 text-lg text-green-100">
            {t("servicesPage.cta.subtitle")}
          </p>
          {/* Use the Link component for navigation */}
          <Link
            to="/sign-up"
            className="inline-block mt-8 px-8 py-3 bg-white text-green-800 font-bold rounded-full shadow-lg hover:bg-green-100 transition-colors duration-300"
          >
            {t("servicesPage.cta.button")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
