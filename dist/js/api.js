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

  const isLocal = typeof window !== "undefined" && (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );

  if (isLocal) {
    if (window.location.protocol === "file:" || (window.location.port !== "5000" && window.location.port !== "3000")) {
      return "http://localhost:5000";
    }
    return "";
  }

  return "https://ojaswi-food-backend.onrender.com";
}

export async function apiRequest(endpoint, options = {}) {
  const baseUrl = resolveApiBaseUrl();
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
    credentials: isLocalFile ? "omit" : "include" // Send HttpOnly auth cookie when not file://
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
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
  return /^\d{10}$/.test(cleaned);
}
