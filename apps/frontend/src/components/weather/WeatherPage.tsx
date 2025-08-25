import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudSunIcon,
  SunIcon,
  CloudIcon,
  CloudRainIcon,
  CloudLightningIcon,
  MapPinIcon,
  DropletIcon
} from "lucide-react";

interface WeatherForecast {
  location: string;
  temp: number;
  humidity: number;
  description: string;
  icon: string;
}

interface CropAdvice {
  soilType: string;
  recommendedCrops: string[];
}

interface WeatherData {
  weatherForecast: WeatherForecast;
  cropAdvice: CropAdvice;
}

type Status = "idle" | "loading" | "success" | "error";
const WeatherCard = ({ data }: { data: WeatherForecast }) => {
  const { location, temp, humidity, description, icon } = data;
  const { t } = useTranslation();

  const getWeatherIcon = (weatherIcon: string) => {
    switch (weatherIcon.toLowerCase()) {
      case "sunny":
        return <SunIcon className="w-16 h-16 text-yellow-400" />;
      case "cloudy":
        return <CloudIcon className="w-16 h-16 text-gray-400" />;
      case "rain":
        return <CloudRainIcon className="w-16 h-16 text-blue-400" />;
      case "storm":
        return <CloudLightningIcon className="w-16 h-16 text-purple-400" />;
      default:
        return <CloudSunIcon className="w-16 h-16 text-green-400" />;
    }
  };

  return (
    <div className="flex flex-col p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-700">
          <MapPinIcon className="w-5 h-5 mr-2" />
          <p className="text-xl font-medium">{location}</p>
        </div>
        {getWeatherIcon(icon)}
      </div>

      <div className="flex-grow">
        <h2 className="text-6xl font-extrabold text-gray-900 leading-none">
          {temp}°C
        </h2>
        <p className="text-lg font-light text-gray-600 mt-2 capitalize">
          {t(`weatherPage.weatherCard.description.${icon.toLowerCase()}`)}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center text-gray-500">
          <DropletIcon className="w-5 h-5 mr-1" />
          <p className="text-md font-semibold">
            {t("weatherPage.weatherCard.humidity")}: {humidity}%
          </p>
        </div>
      </div>
    </div>
  );
};
const CropAdviceCard = ({ data }: { data: CropAdvice }) => {
  const { t } = useTranslation();
  return (
    <div className="p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-gray-100">
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-4xl">🌱</span>
        <h2 className="text-3xl font-bold text-gray-800">{t("weatherPage.cropAdviceCard.title")}</h2>
      </div>
      <div className="space-y-4 text-gray-700">
        <p className="text-lg">
          <span className="font-semibold">{t("weatherPage.cropAdviceCard.soilType")}:</span> {data.soilType}
        </p>
        <div>
          <p className="text-lg font-semibold mb-2">{t("weatherPage.cropAdviceCard.recommendedCrops")}:</p>
          <ul className="list-disc list-inside space-y-1">
            {data.recommendedCrops.map((crop, index) => (
              <li key={index}>{crop}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const WeatherPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async (lat?: number, lon?: number) => {
      setStatus("loading");
      try {
        const response = await fetch("http://localhost:5000/api/weather-prediction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t("weatherPage.errorMessage.generic"));
        }

        const data: WeatherData = await response.json();
        setData(data);
        setStatus("success");
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || t("weatherPage.errorMessage.generic"));
        setStatus("error");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => fetchWeatherData()
      );
    } else {
      fetchWeatherData();
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-lime-600 text-white">
        <div className="text-center p-8">
          <div className="animate-pulse h-16 w-16 text-6xl mx-auto">☁️</div>
          <p className="mt-4 text-lg font-medium">{t("weatherPage.loadingMessage")}</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-lime-600 text-white">
        <div className="text-center p-8">
          <span className="text-6xl animate-bounce">⚠️</span>
          <h2 className="mt-4 text-2xl font-bold text-red-300">{t("weatherPage.errorMessage.title")}</h2>
          <p className="mt-2 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center font-sans text-gray-800">
      <div className="w-full max-w-6xl mx-auto space-y-16">
        <header className="text-center mb-10 text-white">
          <h1 className="text-6xl font-extrabold tracking-tight">
            {t("weatherPage.header.title")}
          </h1>
          <p className="mt-2 text-xl font-light opacity-90">
            {t("weatherPage.header.subtitle")}
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <WeatherCard data={data.weatherForecast} />
          <CropAdviceCard data={data.cropAdvice} />
        </main>
      </div>
    </div>
  );
};

export default WeatherPage;
