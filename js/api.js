/**
 * Ojaswi API Client & Toast Alert System
 */

function resolveApiBaseUrl() {
  if (typeof window !== "undefined") {
    if (window.OJASWI_API_URL && typeof window.OJASWI_API_URL === "string" && window.OJASWI_API_URL.trim()) {
      return window.OJASWI_API_URL.trim().replace(/\/+$/, "");
    }
    if (window.OJASWIAPIURL && typeof window.OJASWIAPIURL === "string" && window.OJASWIAPIURL.trim()) {
      return window.OJASWIAPIURL.trim().replace(/\/+$/, "");
    }
    if (window.VITE_API_URL && typeof window.VITE_API_URL === "string" && window.VITE_API_URL.trim()) {
      return window.VITE_API_URL.trim().replace(/\/+$/, "");
    }
    if (window.__ENV__?.API_URL && typeof window.__ENV__.API_URL === "string" && window.__ENV__.API_URL.trim()) {
      return window.__ENV__.API_URL.trim().replace(/\/+$/, "");
    }
    const meta = document.querySelector('meta[name="api-base-url"]');
    if (meta && meta.content && !meta.content.startsWith("%") && meta.content.trim()) {
      return meta.content.trim().replace(/\/+$/, "");
    }
  }

  // If running strictly on localhost:3000 or localhost:5000 with a local backend
  if (typeof window !== "undefined" && window.location.hostname === "localhost" && (window.location.port === "3000" || window.location.port === "5000")) {
    return "http://localhost:5000";
  }

  return "https://ojaswi-food-backend.onrender.com";
}

export async function apiRequest(endpoint, options = {}) {
  const primaryBaseUrl = resolveApiBaseUrl();
  const fallbackBaseUrl = "https://ojaswi-food-backend.onrender.com";

  async function executeFetch(baseUrl) {
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json"
    };

    let token = null;
    try {
      const storage = window.safeLocalStorage || window.localStorage;
      if (storage) token = storage.getItem("ojaswi_token");
    } catch (e) {}
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const isLocalFile = typeof window !== "undefined" && window.location.protocol === "file:";
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      credentials: isLocalFile ? "omit" : "include"
    };

    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || data.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return data;
  }

  try {
    return await executeFetch(primaryBaseUrl);
  } catch (err) {
    const isNetworkError = err.name === "TypeError" && (
      err.message.includes("fetch") || 
      err.message.includes("Failed to fetch") || 
      err.message.includes("NetworkError") ||
      err.message.includes("network")
    );

    if (isNetworkError && primaryBaseUrl !== fallbackBaseUrl && !endpoint.startsWith("http")) {
      console.warn(`[API Failover] Connection to ${primaryBaseUrl} failed. Retrying with live cloud backend: ${fallbackBaseUrl}`);
      try {
        return await executeFetch(fallbackBaseUrl);
      } catch (fallbackErr) {
        console.error("[API Failover Error]:", fallbackErr);
      }
    }

    if (isNetworkError) {
      throw new Error("Unable to connect to Ojaswi Backend Server. Please check your network connection and try again.");
    }
    throw err;
  }
}

export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Normalizes any phone input into a standard 10-digit number.
 * Handles formats like +91 76200 98478, 07620098478, 76200-98478.
 */
export function cleanPhoneNumber(input) {
  if (!input) return "";
  let str = String(input).trim().replace(/[\s\-\(\)\.]/g, "");
  if (str.startsWith("+91")) str = str.slice(3);
  else if (str.startsWith("91") && str.length === 12) str = str.slice(2);
  else if (str.startsWith("0") && str.length === 11) str = str.slice(1);
  return str;
}

/**
 * Validates if the normalized input is a standard 10-digit mobile number.
 */
export function isValidPhoneNumber(input) {
  const cleaned = cleanPhoneNumber(input);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Decodes Google Identity Services JWT credential
 */
export function decodeGoogleJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    console.warn("Could not decode Google JWT:", e);
    return null;
  }
}

/**
 * Perform Google Sign-In / Registration API call
 */
export async function googleLogin(data) {
  return await apiRequest("/api/auth/google", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

/**
 * Check current logged in user session
 */
export async function getCurrentUser() {
  try {
    return await apiRequest("/api/auth/me");
  } catch(e) {
    return { success: false, isAuthenticated: false, user: null };
  }
}

/**
 * Customer Logout
 */
export async function logoutCustomer() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch(e) {}
  try {
    const storage = window.safeLocalStorage || window.localStorage;
    if (storage) {
      storage.removeItem("ojaswi_token");
      storage.removeItem("ojaswi_user");
    }
  } catch(e) {}
}

if (typeof window !== "undefined") {
  window.apiRequest = apiRequest;
  window.showToast = showToast;
  window.cleanPhoneNumber = cleanPhoneNumber;
  window.isValidPhoneNumber = isValidPhoneNumber;
  window.decodeGoogleJwt = decodeGoogleJwt;
  window.googleLogin = googleLogin;
  window.getCurrentUser = getCurrentUser;
  window.logoutCustomer = logoutCustomer;
}
