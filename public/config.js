/**
 * Ojaswi Premium Spices - Frontend Runtime Configuration
 * Live Production Cloud Backend: https://ojaswi-food-backend.onrender.com
 */
(function () {
  const prodApiUrl = "https://ojaswi-food-backend.onrender.com";

  // Default to live production backend so registration & sign-in work everywhere
  // (including file://, Live Server, and deployed domains) without requiring a local server.
  const resolved = window.OJASWI_API_URL || 
                   window.OJASWIAPIURL || 
                   window.VITE_API_URL || 
                   prodApiUrl;

  window.OJASWI_API_URL = resolved;
  window.OJASWIAPIURL = resolved;
  window.OJASWI_PROD_API_URL = prodApiUrl;
})();
