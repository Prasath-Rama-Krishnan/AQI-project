// Determine backend URL based on environment
const getBackendUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  // In production, use the same origin as the frontend or environment variable
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl) return backendUrl;
  // Fallback: assume backend is on same host, different port or path
  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

export const BACKEND_URL = getBackendUrl();

// Helper for API endpoints
export const API_ENDPOINTS = {
  upload: `${BACKEND_URL}/api/predict/upload`,
  download: `${BACKEND_URL}/api/predict/download`,
  historical: `${BACKEND_URL}/api/predict/historical`,
  insights: `${BACKEND_URL}/api/predict/insights`,
  purifierSuggestions: `${BACKEND_URL}/api/purifier/suggestions`,
};

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BACKEND_URL}/api/predict/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}

export async function getPurifierSuggestions(state) {
  const response = await fetch(
    `${API_ENDPOINTS.purifierSuggestions}?state=${encodeURIComponent(state)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch purifier suggestions");
  }

  return response.json();
}
