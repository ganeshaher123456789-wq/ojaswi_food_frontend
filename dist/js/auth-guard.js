/**
 * Ojaswi Foods - Strict Authentication Guard
 * 1. Enforces manual Google login on opening or refreshing the website.
 * 2. Prevents automatic persistent login across browser sessions or page refreshes.
 * 3. Protects private pages (storefront, cart, checkout, profile, orders).
 */
(function () {
  if (typeof window === "undefined") return;

  function isReload() {
    try {
      const navEntries = window.performance?.getEntriesByType?.("navigation");
      if (navEntries && navEntries.length > 0) {
        return navEntries[0].type === "reload";
      }
      if (window.performance?.navigation?.type === 1) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  function getSessionToken() {
    try {
      const ss = window.safeSessionStorage || window.sessionStorage;
      const active = ss ? ss.getItem("ojaswi_auth_active") : null;
      const token = ss ? ss.getItem("ojaswi_token") : null;
      if (active === "true" && token) {
        return token;
      }
    } catch (_) {}
    return null;
  }

  function clearAuthSession() {
    try {
      const ss = window.safeSessionStorage || window.sessionStorage;
      if (ss) {
        ss.removeItem("ojaswi_token");
        ss.removeItem("ojaswi_user");
        ss.removeItem("ojaswi_auth_active");
      }
      const ls = window.safeLocalStorage || window.localStorage;
      if (ls) {
        ls.removeItem("ojaswi_token");
        ls.removeItem("ojaswi_user");
        ls.removeItem("ojaswi_auth_active");
      }
    } catch (_) {}
  }

  window.ojaswiAuth = {
    isReload: isReload,
    getSessionToken: getSessionToken,
    clearAuthSession: clearAuthSession,
    setSession: function(token, user) {
      try {
        const ss = window.safeSessionStorage || window.sessionStorage;
        if (ss) {
          ss.setItem("ojaswi_token", token);
          if (user) ss.setItem("ojaswi_user", JSON.stringify(user));
          ss.setItem("ojaswi_auth_active", "true");
        }
        const ls = window.safeLocalStorage || window.localStorage;
        if (ls) {
          ls.setItem("ojaswi_token", token);
          if (user) ls.setItem("ojaswi_user", JSON.stringify(user));
          ls.setItem("ojaswi_auth_active", "true");
        }
      } catch (_) {}
    },
    guard: function() {
      const path = (window.location.pathname || "").toLowerCase();
      const isLogin = path.includes("login.html") || path.endsWith("/login");
      const isLocal = window.location.protocol === "file:" || path.endsWith(".html");
      const targetLogin = isLocal ? "login.html" : "/login";

      // On login.html itself, do not redirect
      if (isLogin) {
        return true;
      }

      // Requirement 1 & 2: Whenever a customer opens or refreshes the website,
      // do not automatically log them in. Require manual Google Sign-In.
      if (isReload()) {
        clearAuthSession();
        window.location.replace(targetLogin);
        return false;
      }

      // Check for active authenticated session in current window
      const token = getSessionToken();
      if (!token) {
        clearAuthSession();
        window.location.replace(targetLogin);
        return false;
      }

      return true;
    }
  };

  // Run guard immediately on script execution
  window.ojaswiAuth.guard();
})();
