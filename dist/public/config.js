/**
 * Ojaswi Premium Spices - Frontend Production Configuration (Vercel Build)
 * Live Render Backend: https://ojaswi-food-backend.onrender.com
 */
(function() {
  const isLocal = typeof window !== "undefined" && (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
  const defaultApiUrl = isLocal ? "http://localhost:5000" : "https://ojaswi-food-backend.onrender.com";
  const resolved = window.OJASWI_API_URL || window.OJASWIAPIURL || window.VITE_API_URL || defaultApiUrl;
  window.OJASWI_API_URL = resolved;
  window.OJASWIAPIURL = resolved;
  window.GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || "";
})();
