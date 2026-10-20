/**
 * Ojaswi Premium Spices - Frontend Runtime Configuration
 * Backend hosted on Render: https://ojaswi-food-backend.onrender.com
 */
(function () {
  const isLocal = typeof window !== "undefined" && (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );

  const defaultApiUrl = isLocal 
    ? "http://localhost:5000" 
    : "https://ojaswi-food-backend.onrender.com";

  const resolved = window.OJASWI_API_URL || 
                   window.OJASWIAPIURL || 
                   window.VITE_API_URL || 
                   defaultApiUrl;

  window.OJASWI_API_URL = resolved;
  window.OJASWIAPIURL = resolved;
})();
