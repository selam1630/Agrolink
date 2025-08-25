import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  LineChartIcon,
  NewspaperIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusCircleIcon
} from "lucide-react";
type PriceChange = "up" | "down" | "none";
interface MarketPrice {
  crop: string;
  price: number;
  change: PriceChange;
}
interface NewsArticle {
  id: number;
  image: string;
  title: string;
  snippet: string;
  date: string;
}

const NewsPage = () => {
  const { t } = useTranslation();
  const marketPrices: MarketPrice[] = [
    { crop: "wheat", price: 2500, change: "up" },
    { crop: "coffee", price: 8500, change: "down" },
    { crop: "teff", price: 6200, change: "up" },
    { crop: "maize", price: 1800, change: "down" },
    { crop: "sesame", price: 7100, change: "none" },
  ];
  const newsArticles: NewsArticle[] = [
    {
      id: 1,
      image: "https://placehold.co/600x400/22c55e/ffffff?text=Farming+Innovation",
      title: t("news.articles.0.title"),
      snippet: t("news.articles.0.snippet"),
      date: "May 20, 2024",
    },
    {
      id: 2,
      image: "https://placehold.co/600x400/22c55e/ffffff?text=Harvest+Report",
      title: t("news.articles.1.title"),
      snippet: t("news.articles.1.snippet"),
      date: "May 18, 2024",
    },
    {
      id: 3,
      image: "https://placehold.co/600x400/22c55e/ffffff?text=New+Irrigation+System",
      title: t("news.articles.2.title"),
      snippet: t("news.articles.2.snippet"),
      date: "May 15, 2024",
    },
    {
      id: 4,
      image: "https://placehold.co/600x400/22c55e/ffffff?text=Weather+Advisory",
      title: t("news.articles.3.title"),
      snippet: t("news.articles.3.snippet"),
      date: "May 12, 2024",
    },
  ];
  const getChangeIcon = (change: PriceChange) => {
    switch (change) {
      case "up":
        return <TrendingUpIcon className="w-5 h-5 text-green-500" />;
      case "down":
        return <TrendingDownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <MinusCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-green-800 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700 opacity-80"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-green-300" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {t("newsPage.hero.title")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-green-100">
            {t("newsPage.hero.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Market Prices Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("newsPage.marketPrices.title")}
            </h2>
            <LineChartIcon className="w-8 h-8 text-green-700" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-4">{t("newsPage.marketPrices.lastWeek")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketPrices.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded-lg flex justify-between items-center transition-transform transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-semibold capitalize mr-2">{t(`crops.${item.crop}`)}:</span>
                    <span className="text-xl font-bold text-green-700">{item.price}</span>
                    <span className="text-sm text-gray-500 ml-1">ETB</span>
                  </div>
                  {getChangeIcon(item.change)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest News Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("newsPage.latestNews.title")}
            </h2>
            <NewspaperIcon className="w-8 h-8 text-green-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article: NewsArticle) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {article.snippet}
                  </p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <span className="mr-auto">{article.date}</span>
                    <Link
                      to={`/news/${article.id}`}
                      className="text-green-600 hover:text-green-800 font-semibold"
                    >
                      {t("newsPage.latestNews.readMore")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
