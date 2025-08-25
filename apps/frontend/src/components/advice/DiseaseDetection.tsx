import React, { useState } from "react";
import axios from "axios";

interface AnalysisResult {
  diseaseName: string;
  causes: string;
  treatment: string;
}

const DiseaseDetection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(
        import.meta.env.VITE_API_URL2 + "/api/diseaseDetection",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResult(response.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      {/* Increased max-w-lg to max-w-3xl for a larger container */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl"> 
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          🌿 Plant Disease Detection
        </h1>

        {/* Image Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        {/* Preview Selected Image */}
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-[500px] object-cover rounded-lg mb-4 border"
          />
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 border rounded-lg bg-green-100">
            <h2 className="text-xl font-semibold">Result</h2>
            <p><strong>Disease:</strong> {result.diseaseName}</p>
            <p><strong>Causes:</strong> {result.causes}</p>
            <p><strong>Treatment:</strong></p>
            <ul className="list-decimal list-inside">
              {result.treatment
                .split(/\n|[0-9]\./)
                .filter(line => line.trim() !== "")
                .map((line, idx) => (
                  <li key={idx}>{line.trim()}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;
