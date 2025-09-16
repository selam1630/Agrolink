import React, { useState, useEffect } from 'react';

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface Wind {
  speed: number;
  deg: number;
}

interface WeatherData {
  weather: Weather[];
  main: Main;
  wind: Wind;
  name: string;
}

interface Advice {
  weatherPrediction: string;
  soilAndWaterAdvice: string;
  pestAndDiseaseAdvice: string;
  recommendedCrops: string[];
  emergencyPreparedness: string;
  locationSpecificTips: string;
  disasterAlerts: { description: string }[]; // CORRECTED: This interface must match the backend's data structure
}

interface APIResponse {
  location: string;
  weatherData: WeatherData;
  advice: Advice;
}

const WeatherDashboard: React.FC = () => {
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [language, setLanguage] = useState<string>('en');

  // Get real user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to fetch location. Please allow location access.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  }, []);

  // Fetch weather and advice after getting location or changing language
  useEffect(() => {
    const fetchWeatherAndAdvice = async () => {
      if (!userLocation) return;
      setIsLoading(true);
      setError(null);
      try {
        const backendUrl = "http://localhost:5000/api/weather-prediction/advice";

        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userLocation, language }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch data from backend.");
        }

        const result: APIResponse = await response.json();
        setData(result);
      } catch (err: unknown) {
        console.error("Error fetching from backend:", err);
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherAndAdvice();
  }, [userLocation, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600 text-xl font-semibold">Loading agricultural advice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-red-700 font-medium max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <p className="text-sm mt-2 text-gray-500">Please make sure your backend server is running and accessible.</p>
        </div>
      </div>
    );
  }

  if (!data || !data.advice) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-gray-700 font-medium max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">No Advice Available</h2>
          <p>Please check the response from the server.</p>
        </div>
      </div>
    );
  }

  const { weatherData, advice, location } = data;
  const { weatherPrediction, soilAndWaterAdvice, pestAndDiseaseAdvice, recommendedCrops, emergencyPreparedness, locationSpecificTips, disasterAlerts } = advice;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-start p-6 font-sans">
      {/* Language selector */}
      <div className="w-full max-w-4xl mb-4 flex justify-end">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-300 rounded-xl p-2 shadow-sm"
        >
          <option value="en">English</option>
          <option value="am">Amharic</option>
          <option value="om">Oromo</option>
          <option value="ti">Tigrinya</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 transform transition-all duration-500 hover:scale-105">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-green-900 mb-2">Agricultural Dashboard</h1>
            <p className="text-xl text-gray-600 font-medium">{location || 'Your Location'}</p>
          </div>
          {weatherData && (
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-5xl font-bold text-blue-600">{Math.round(weatherData.main.temp)}°C</p>
              <p className="text-gray-500">{weatherData.weather[0].description}</p>
            </div>
          )}
        </div>

        {disasterAlerts && disasterAlerts.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.53-1.636 1.748-3.098L13.196 3.098C12.414 1.636 10.59 1.636 9.808 3.098L4.312 11.902C3.53 13.364 4.52 15 6.062 15z" />
              </svg>
              <h3 className="font-bold text-lg">Disaster Alert</h3>
            </div>
            {disasterAlerts.map((alert, index) => (
              <p key={index} className="mt-2 text-sm md:text-base">{alert.description}</p> // FIXED LINE
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Weather & Forecast</h3>
            <p className="text-gray-700 leading-relaxed">{weatherPrediction}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Soil & Water Management</h3>
            <p className="text-gray-700 leading-relaxed">{soilAndWaterAdvice}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pest & Disease Prevention</h3>
            <p className="text-gray-700 leading-relaxed">{pestAndDiseaseAdvice}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Recommended Crops</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {recommendedCrops.map((crop, index) => (
                <li key={index} className="mb-1">{crop}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Preparedness</h3>
            <p className="text-gray-700 leading-relaxed">{emergencyPreparedness}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Location-Specific Tips</h3>
            <p className="text-gray-700 leading-relaxed">{locationSpecificTips}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;