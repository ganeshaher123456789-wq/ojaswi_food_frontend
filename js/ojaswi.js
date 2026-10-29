/**
 * Ojaswi Premium Spices - Universal Client Library
 * Handles: Cart, Product Details, Auth, Toasts, API requests & Navigation
 * Works in both HTTP (Node.js/Express) and local file:// environments without CORS blocks.
 */

(function (window, document) {
  "use strict";

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

  const isAboutSrcdoc = window.location.protocol === "about:" || (window.location.href && window.location.href.startsWith("about:"));
  const isLocalFile = window.location.protocol === "file:" || isAboutSrcdoc;
  const BASE_URL = resolveApiBaseUrl();

  // Safe Storage System (Resilient against sandboxed iframes, disabled storage, and private mode)
  const memoryStore = { local: {}, session: {} };
  function createSafeStorage(type) {
    const mem = memoryStore[type === "sessionStorage" ? "session" : "local"];
    return {
      getItem(key) {
        try {
          if (window[type]) return window[type].getItem(key);
        } catch (e) {}
        return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
      },
      setItem(key, val) {
        try {
          if (window[type]) {
            window[type].setItem(key, String(val));
            return;
          }
        } catch (e) {}
        mem[key] = String(val);
      },
      removeItem(key) {
        try {
          if (window[type]) {
            window[type].removeItem(key);
            return;
          }
        } catch (e) {}
        delete mem[key];
      },
      clear() {
        try {
          if (window[type]) {
            window[type].clear();
            return;
          }
        } catch (e) {}
        Object.keys(mem).forEach(k => delete mem[k]);
      }
    };
  }

  const safeLocalStorage = createSafeStorage("localStorage");
  const safeSessionStorage = createSafeStorage("sessionStorage");
  window.safeLocalStorage = safeLocalStorage;
  window.safeSessionStorage = safeSessionStorage;
  const localStorage = safeLocalStorage;
  const sessionStorage = safeSessionStorage;

  // Safe Navigation Helper (Prevents SyntaxError in sandboxed about:srcdoc iframes & empty URLs)
  function safeNavigate(url, fallbackHash) {
    if (!url || typeof url !== "string" || !url.trim()) {
      if (fallbackHash) {
        try { window.location.hash = fallbackHash; } catch (e) {}
      }
      return;
    }

    try {
      if (isAboutSrcdoc) {
        console.warn("[Ojaswi Navigation] Sandboxed preview detected for URL:", url);
        if (window.top && window.top !== window) {
          try {
            window.top.location.href = url;
            return;
          } catch (topErr) {}
        }
        if (fallbackHash) {
          try { window.location.hash = fallbackHash; } catch (e) {}
        }
        return;
      }
      window.location.href = url;
    } catch (err) {
      console.warn("[Ojaswi Safe Navigation Fallback]:", err);
      try {
        if (fallbackHash) window.location.hash = fallbackHash;
      } catch (e) {}
    }
  }
  window.safeNavigate = safeNavigate;

  // Universal Navigation & Target Resolution Helpers
  function isStaticOrLocalMode() {
    if (typeof window === "undefined") return false;
    const proto = window.location.protocol;
    const path = window.location.pathname || "";
    const port = window.location.port || "";
    const host = window.location.hostname || "";
    return (
      proto === "file:" ||
      proto === "about:" ||
      path.endsWith(".html") ||
      path.includes(".html") ||
      path.includes("/public/") ||
      path.includes("/frontend/") ||
      port === "5500" ||
      port === "5501" ||
      port === "8080" ||
      port === "3000" ||
      (port !== "5000" && (host === "localhost" || host === "127.0.0.1"))
    );
  }
  window.isStaticOrLocalMode = isStaticOrLocalMode;

  function resolveTargetUrl(page) {
    if (!page || typeof page !== "string") return "index.html";
    if (isStaticOrLocalMode()) {
      return page;
    }
    const clean = "/" + page.replace(/\.html$/, "");
    return clean === "/index" ? "/" : clean;
  }
  window.resolveTargetUrl = resolveTargetUrl;

  function goToAccount(e) {
    if (e && e.preventDefault) e.preventDefault();
    const target = resolveTargetUrl("account.html");
    safeNavigate(target, "#account");
  }
  window.goToAccount = goToAccount;

  function goToStore(e) {
    if (e && e.preventDefault) e.preventDefault();
    const target = resolveTargetUrl("index.html");
    safeNavigate(target, "");
  }
  window.goToStore = goToStore;

  function goToLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const target = resolveTargetUrl("login.html");
    safeNavigate(target, "#login");
  }
  window.goToLogin = goToLogin;

  function goToOrders(e) {
    if (e && e.preventDefault) e.preventDefault();
    const target = resolveTargetUrl("orders.html");
    safeNavigate(target, "#orders");
  }
  window.goToOrders = goToOrders;

  function goToCheckout(e) {
    if (e && e.preventDefault) e.preventDefault();
    const target = resolveTargetUrl("checkout.html");
    safeNavigate(target, "#checkout");
  }
  window.goToCheckout = goToCheckout;

  // =========================================================
  // 1. TOAST NOTIFICATIONS
  // =========================================================
  function showToast(message, type = "info") {
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
  window.showToast = showToast;

  // =========================================================
  // 2. PHONE NORMALIZATION & VALIDATION
  // =========================================================
  function cleanPhoneNumber(input) {
    if (!input) return "";
    let str = String(input).trim().replace(/[\s\-\(\)\.]/g, "");
    if (str.startsWith("+91")) str = str.slice(3);
    else if (str.startsWith("91") && str.length === 12) str = str.slice(2);
    else if (str.startsWith("0") && str.length === 11) str = str.slice(1);
    return str;
  }
  window.cleanPhoneNumber = cleanPhoneNumber;

  function isValidPhoneNumber(input) {
    const cleaned = cleanPhoneNumber(input);
    return /^\d{10}$/.test(cleaned);
  }
  window.isValidPhoneNumber = isValidPhoneNumber;

  // =========================================================
  // 3. API REQUEST CLIENT (WITH SMART OFFLINE/LOCAL FALLBACK)
  // =========================================================
  async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : BASE_URL + endpoint;

    const defaultHeaders = {
      "Content-Type": "application/json"
    };

    const token = localStorage.getItem("ojaswi_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      credentials: isLocalFile ? "omit" : "include"
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      if ((url.startsWith("http://localhost:5000") || url.startsWith("http://127.0.0.1:5000")) && !options._retried) {
        try {
          const fallbackUrl = "https://ojaswi-food-backend.onrender.com" + endpoint;
          console.warn(`[API Fallback] Local server unreachable. Retrying with Render: ${fallbackUrl}`);
          return await apiRequest(fallbackUrl, { ...options, _retried: true });
        } catch (fallbackErr) {
          console.warn("[API Fallback Error]:", fallbackErr.message);
        }
      }
      console.error(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  }
  window.apiRequest = apiRequest;

  // =========================================================
  // 4. SHOPPING CART SYSTEM (CUSTOMER-ISOLATED & BACKEND-SYNCED)
  // =========================================================
  function getCurrentAuthUser() {
    try {
      const raw = (window.safeLocalStorage ? window.safeLocalStorage.getItem("ojaswi_user") : localStorage.getItem("ojaswi_user"));
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.id) return u;
      }
    } catch (_) {}
    return null;
  }

  class CartManager {
    constructor() {
      this.currentUser = getCurrentAuthUser();
      this.items = this.load();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.init());
      } else {
        this.init();
      }
    }

    getStorageKey() {
      if (this.currentUser && this.currentUser.id) {
        return `ojaswi_cart_items_user_${this.currentUser.id}`;
      }
      return "ojaswi_cart_items_guest";
    }

    init() {
      this.initDrawer();
      this.updateBadges();
      // If user is logged in and cart is empty, try hydrating from backend
      if (this.currentUser && this.currentUser.id && this.items.length === 0) {
        this.fetchBackendCart();
      }
    }

    async fetchBackendCart() {
      try {
        const res = await apiRequest("/api/cart");
        if (res && res.cart && Array.isArray(res.cart.items) && res.cart.items.length > 0) {
          this.items = res.cart.items.map(it => ({
            id: it.product_id || it.id,
            name: it.product_name || it.name,
            selling_price: it.selling_price || it.price,
            price: it.price,
            image: it.image || "images/garam-masala.jpeg",
            weight: it.weight || "NET WEIGHT 500g",
            sku: it.sku || `OJ-${it.product_id || it.id}`,
            quantity: it.quantity || 1
          }));
          this.save();
        }
      } catch (_) {}
    }

    async switchUser(user) {
      this.currentUser = user && user.id ? user : null;
      this.items = this.load();
      this.updateBadges();
      this.renderDrawer();
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items: this.items } }));

      if (this.currentUser && this.currentUser.id) {
        await this.fetchBackendCart();
      }
    }

    load() {
      try {
        const stored = localStorage.getItem(this.getStorageKey());
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
      return [];
    }

    save() {
      try {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.items));
      } catch (e) {
        console.warn("Cart save warning:", e);
      }
      this.updateBadges();
      this.renderDrawer();
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items: this.items } }));
    }

    getItems() {
      return this.items;
    }

    getCount() {
      return this.items.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    getSubtotal() {
      return this.items.reduce((sum, item) => sum + (item.selling_price || item.price) * (item.quantity || 1), 0);
    }

    addItem(product, quantity = 1) {
      const qty = parseInt(quantity, 10) || 1;
      const existingIndex = this.items.findIndex((i) => i.id === product.id);

      if (existingIndex > -1) {
        this.items[existingIndex].quantity += qty;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          selling_price: product.selling_price || product.price,
          price: product.price,
          image: product.image || "images/garam-masala.jpeg",
          weight: product.weight || "NET WEIGHT 500g",
          sku: product.sku || `OJ-0${product.id}`,
          quantity: qty
        });
      }

      this.save();
      showToast(`Added ${product.name} to cart.`, "success");

      // Non-blocking sync with backend cart
      apiRequest("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: qty })
      }).catch(() => {});
    }

    updateQty(productId, newQty) {
      const qty = parseInt(newQty, 10);
      const item = this.items.find((i) => i.id === productId);
      if (!item) return;

      if (qty <= 0) {
        this.removeItem(productId);
        return;
      }

      item.quantity = Math.min(qty, 50);
      this.save();

      // Non-blocking sync with backend cart
      apiRequest("/api/cart", {
        method: "PUT",
        body: JSON.stringify({ productId, quantity: item.quantity })
      }).catch(() => {});
    }

    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
      this.save();
      showToast("Item removed from cart.", "info");

      // Non-blocking sync with backend cart
      apiRequest(`/api/cart/${productId}`, {
        method: "DELETE"
      }).catch(() => {});
    }

    clear() {
      this.items = [];
      this.save();

      // Non-blocking sync with backend cart
      apiRequest("/api/cart", {
        method: "DELETE"
      }).catch(() => {});
    }

    updateBadges() {
      const count = this.getCount();
      document.querySelectorAll(".cart-count-badge").forEach((el) => {
        el.textContent = count;
        el.style.display = count > 0 ? "inline-flex" : "none";
      });
    }

    initDrawer() {
      if (!document.getElementById("cartDrawer")) {
        const drawerHtml = `
          <div id="cartDrawerOverlay" class="cart-drawer-overlay" style="display: none;"></div>
          <aside id="cartDrawer" class="cart-drawer" style="display: none;" aria-label="Shopping Cart">
            <div class="cart-header">
              <h2 class="cart-title">Your Cart</h2>
              <button id="cartDrawerClose" class="cart-close" aria-label="Close Cart">&times;</button>
            </div>
            <div id="cartDrawerItems" class="cart-items">
              <!-- Dynamic Cart Items -->
            </div>
            <div class="cart-footer">
              <div class="cart-subtotal-row">
                <span>Subtotal:</span>
                <span id="cartDrawerSubtotal">₹0</span>
              </div>
              <div class="cart-subtotal-row" style="color: #2ecc71;">
                <span>Delivery Charge:</span>
                <span>FREE</span>
              </div>
              <div class="cart-total-row">
                <span>Estimated Total:</span>
                <span id="cartDrawerTotal">₹0</span>
              </div>
              <a href="checkout.html" id="cartDrawerCheckoutBtn" class="cart-checkout-btn" style="display: block; text-decoration: none; text-align: center; box-sizing: border-box; cursor: pointer;">⚡ Proceed to Checkout</a>
            </div>
          </aside>
        `;
        document.body.insertAdjacentHTML("beforeend", drawerHtml);

        const overlay = document.getElementById("cartDrawerOverlay");
        const closeBtn = document.getElementById("cartDrawerClose");
        const checkoutBtn = document.getElementById("cartDrawerCheckoutBtn");

        overlay?.addEventListener("click", () => this.closeDrawer());
        closeBtn?.addEventListener("click", () => this.closeDrawer());
        checkoutBtn?.addEventListener("click", (e) => {
          this.closeDrawer();
          goToCheckout(e);
        });
      }

      // Attach click listeners to all .cart-toggle-btn
      document.querySelectorAll(".cart-toggle-btn").forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          this.openDrawer();
        };
      });

      this.renderDrawer();
    }

    openDrawer() {
      this.initDrawer();
      this.renderDrawer();
      const overlay = document.getElementById("cartDrawerOverlay");
      const drawer = document.getElementById("cartDrawer");
      if (overlay) {
        overlay.style.display = "block";
        overlay.classList.add("active");
      }
      if (drawer) {
        drawer.style.display = "flex";
        drawer.classList.add("active");
      }
      document.body.style.overflow = "hidden";
    }

    closeDrawer() {
      const overlay = document.getElementById("cartDrawerOverlay");
      const drawer = document.getElementById("cartDrawer");
      if (overlay) {
        overlay.classList.remove("active");
        overlay.style.display = "none";
      }
      if (drawer) {
        drawer.classList.remove("active");
        drawer.style.display = "none";
      }
      document.body.style.overflow = "";
    }

    renderDrawer() {
      const container = document.getElementById("cartDrawerItems");
      const subtotalEl = document.getElementById("cartDrawerSubtotal");
      const totalEl = document.getElementById("cartDrawerTotal");
      const checkoutBtn = document.getElementById("cartDrawerCheckoutBtn");

      if (!container) return;

      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="cart-empty" style="text-align: center; padding: 40px 20px;">
            <p style="font-size: 40px; margin-bottom: 12px;">🛍️</p>
            <p style="color: #fff; font-size: 16px; font-weight: 600;">Your cart is empty.</p>
            <p style="color: #888; font-size: 12px; margin-top: 5px;">Add our authentic spice blends to get started.</p>
            <button type="button" class="primary-button" style="display: inline-block; margin-top: 18px; padding: 10px 22px; font-size: 13px;" onclick="window.cart.closeDrawer()">
              Explore Spices
            </button>
          </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "₹0";
        if (totalEl) totalEl.textContent = "₹0";
        if (checkoutBtn) {
          checkoutBtn.style.pointerEvents = "none";
          checkoutBtn.style.opacity = "0.5";
          checkoutBtn.setAttribute("aria-disabled", "true");
        }
        return;
      }

      if (checkoutBtn) {
        checkoutBtn.style.pointerEvents = "auto";
        checkoutBtn.style.opacity = "1";
        checkoutBtn.removeAttribute("aria-disabled");
        checkoutBtn.setAttribute("href", resolveTargetUrl("checkout.html"));
        checkoutBtn.onclick = (e) => {
          this.closeDrawer();
          goToCheckout(e);
        };
      }
      const subtotal = this.getSubtotal();
      if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
      if (totalEl) totalEl.textContent = `₹${subtotal}`;

      container.innerHTML = this.items
        .map(
          (item) => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image || 'images/garam-masala.jpeg'}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/garam-masala.jpeg'">
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${item.selling_price || item.price} <span style="font-size: 11px; color: #777;">(${item.weight})</span></div>
              <div class="cart-qty-ctrl">
                <button type="button" class="cart-qty-btn" onclick="window.cart.updateQty(${item.id}, ${item.quantity - 1})">-</button>
                <span class="cart-qty-value">${item.quantity}</span>
                <button type="button" class="cart-qty-btn" onclick="window.cart.updateQty(${item.id}, ${item.quantity + 1})">+</button>
                <button type="button" class="cart-remove-btn" onclick="window.cart.removeItem(${item.id})">Remove</button>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    }
  }

  // Instantiate globally
  window.cart = new CartManager();

  // =========================================================
  // 5. RICH PRODUCT DETAIL MODAL SYSTEM
  // =========================================================
  let currentDetailProduct = null;
  const PRODUCTS_CATALOG = [
    {
      id: 1,
      name: "Garam Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/garam-masala.jpeg",
      images: ["images/garam-masala.jpeg", "images/WhatsApp Image 2026-09-10 at 10.01.48 PM.jpeg"],
      description: "A rich aromatic blend of traditional whole spices for deeply flavourful Indian dishes. Made with pure coriander, cumin, black pepper, cardamom, cinnamon and cloves roasted to perfection.",
      sku: "OJ-GM-01"
    },
    {
      id: 2,
      name: "Kitchen King Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/kitchen-king.jpeg",
      images: ["images/kitchen-king.jpeg", "images/WhatsApp Image 2026-09-10 at 10.02.02 PM.jpeg"],
      description: "A versatile masala blend designed to add colour, warmth and character to everyday vegetables and gravies. The all-in-one kitchen essential for authentic royal flavours.",
      sku: "OJ-KK-02"
    },
    {
      id: 3,
      name: "Sabji Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/sabji-masala.jpeg",
      images: ["images/sabji-masala.jpeg", "images/WhatsApp Image 2026-09-10 at 10.04.46 PM.jpeg"],
      description: "A balanced spice blend for delicious everyday vegetable preparations. Crafted to enhance natural flavours with mild warmth and appetizing golden colour.",
      sku: "OJ-SM-03"
    },
    {
      id: 4,
      name: "Chaat Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/chaat-masala.jpeg",
      images: ["images/chaat-masala.jpeg", "images/WhatsApp Image 2026-09-10 at 10.06.18 PM.jpeg"],
      description: "A tangy, aromatic blend that gives snacks, fruits, salads and chaats an irresistible finishing touch. Features roasted cumin, black salt, amchur and mint.",
      sku: "OJ-CM-04"
    },
    {
      id: 5,
      name: "Biryani Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/biryani-masala.jpeg",
      images: ["images/biryani-masala.jpeg", "images/WhatsApp Image 2026-09-10 at 10.07.44 PM.jpeg"],
      description: "An aromatic combination of exotic whole spices crafted for rich, fragrant biryani. Infused with shahi jeera, star anise, mace, nutmeg, cinnamon and green cardamom.",
      sku: "OJ-BM-05"
    },
    {
      id: 6,
      name: "Pav Bhaji Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/pav-bhaji.jpeg",
      images: ["images/pav-bhaji.jpeg", "images/WhatsApp Image 2026-09-10 at 10.08.50 PM.jpeg"],
      description: "A bold Maharashtrian-inspired blend made for rich, buttery pav bhaji with authentic street-food aroma, vibrant color, and deep savoury taste.",
      sku: "OJ-PB-06"
    },
    {
      id: 7,
      name: "Misal Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/misal-masala.jpeg",
      images: ["images/misal-masala.jpeg", "images/WhatsApp Image 2026-09-10 at 10.11.33 PM.jpeg"],
      description: "A vibrant spice blend for authentic, flavour-packed Maharashtrian misal. Yields rich tari (kat) with signature heat, aroma and unbeatable spicy depth.",
      sku: "OJ-MM-07"
    },
    {
      id: 8,
      name: "Rajma Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/rajma-masala.jpeg",
      images: ["images/rajma-masala.jpeg", "images/spice-08.jpeg"],
      description: "A deeply aromatic, North Indian spice blend specially crafted for rich and luscious Punjabi rajma curry. Freshly stone-ground from selected harvest spice lots.",
      sku: "OJ-RM-08"
    },
    {
      id: 9,
      name: "Chole Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/chole-masala.jpeg",
      images: ["images/chole-masala.jpeg", "images/spice-09.jpeg"],
      description: "A tangy, robustly spiced masala crafted for authentic Amritsari and Punjabi chole with irresistible aroma. Slow dry-roasted whole spices sealed in freshness packaging.",
      sku: "OJ-CM-09"
    },
    {
      id: 10,
      name: "Rasam Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/rasam-masala.jpeg",
      images: ["images/rasam-masala.jpeg", "images/spice-10.jpeg"],
      description: "A fragrant South Indian blend of roasted lentils, pepper, cumin and spices for comforting traditional rasam. Unadulterated, preservative-free recipe with intense natural spice oils.",
      sku: "OJ-RS-10"
    },
    {
      id: 11,
      name: "Sambar Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/sambar-masala.jpeg",
      images: ["images/sambar-masala.jpeg", "images/spice-11.jpeg"],
      description: "An authentic South Indian blend of freshly roasted spices and dals for rich, aromatic and appetizing sambar. Elevates homestyle cooking to gourmet standards.",
      sku: "OJ-SM-11"
    },
    {
      id: 12,
      name: "Tea Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/tea-masala.jpeg",
      images: ["images/tea-masala.jpeg"],
      description: "An exotic aromatic blend of royal dry spices including green cardamom, cinnamon, cloves, dry ginger, black pepper and nutmeg. Brew the ultimate cup of authentic Indian masala chai.",
      sku: "OJ-TM-12"
    },
    {
      id: 13,
      name: "Jaljeera Masala",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/jaljeera-masala.jpeg",
      images: ["images/jaljeera-masala.jpeg"],
      description: "A refreshing zesty blend of dry mint, roasted cumin, black salt, amchur, ginger and hing. An instant digestive refresher and street-style thirst-quencher.",
      sku: "OJ-JM-13"
    },
    {
      id: 14,
      name: "Kasuri Methi",
      price: 99,
      mrp: 149,
      weight: "NET WEIGHT 50g",
      image: "images/kasuri-methi.jpeg",
      images: ["images/kasuri-methi.jpeg"],
      description: "Handpicked, shade-dried aromatic fenugreek leaves from pristine harvest fields. Infuses restaurant-grade richness and lingering gourmet aroma into curries, dal makhani, and parathas.",
      sku: "OJ-KM-14"
    },
    {
      id: 15,
      name: "Dry Ginger Powder",
      price: 199,
      mrp: 249,
      weight: "NET WEIGHT 500g",
      image: "images/dry-ginger-powder.jpeg",
      images: ["images/dry-ginger-powder.jpeg"],
      description: "Finely stone-ground premium sun-dried ginger (Saunth / Sonth) with potent natural gingerol. Imparts warming aroma and sharp zest to masala chai, ayurvedic brews, marinades and curries.",
      sku: "OJ-GP-15"
    }
  ];

  let dynamicProducts = PRODUCTS_CATALOG;

  async function loadProductsCatalog() {
    try {
      const res = await apiRequest("/api/products");
      if (res && res.products && res.products.length > 0) {
        dynamicProducts = res.products;
      }
    } catch {
      // Use built-in catalog fallback
    }
  }
  window.loadProductsCatalog = loadProductsCatalog;

  window.openProductDetail = function (productId) {
    const product = dynamicProducts.find((p) => p.id === productId) || PRODUCTS_CATALOG.find((p) => p.id === productId) || PRODUCTS_CATALOG[0];

    let modal = document.getElementById("productDetailModal");
    if (!modal) {
      const modalHtml = `
        <div id="productDetailModal" class="modal" style="display: none;">
          <div class="product-modal-dialog" style="max-height: 90vh; overflow-y: auto;">
            <button type="button" class="modal-close" onclick="closeProductDetailModal()">&times;</button>
            <div class="product-detail-grid">
              <div>
                <img id="detailMainImg" class="product-gallery-main" src="${product.image}" alt="${product.name}" onerror="this.src='images/garam-masala.jpeg'">
                <div id="detailThumbnails" class="product-thumbnails"></div>
              </div>
              <div>
                <div id="detailBadge" class="product-badge-origin">📍 52/2 Malegaon 423203</div>
                <h2 id="detailTitle" class="product-modal-title">${product.name}</h2>
                <div id="detailRatingBadge" style="display: flex; align-items: center; gap: 8px; margin: 4px 0 10px 0; font-size: 13px; color: var(--gold-light);"></div>
                <div id="detailSku" class="product-modal-sku">SKU: ${product.sku || "OJ-01"} | FSSAI Lic. 3025120612245599988</div>
                <div class="product-modal-price">
                  <span id="detailPrice">₹${product.price}</span>
                  <span id="detailMrp" class="product-modal-mrp">₹${product.mrp || 249}</span>
                </div>
                <p id="detailWeight" style="color: #aaa; font-size: 13px; margin-bottom: 12px;">${product.weight || "NET WEIGHT 500g"}</p>
                <p id="detailDesc" class="product-modal-desc">${product.description}</p>
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                  <label style="font-size: 13px; color: #888;">Quantity:</label>
                  <div class="cart-qty-ctrl" style="background: #1c1c1c; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                    <button type="button" class="cart-qty-btn" onclick="changeDetailQty(-1)">-</button>
                    <span id="detailQty" class="cart-qty-value" style="font-weight: 600;">1</span>
                    <button type="button" class="cart-qty-btn" onclick="changeDetailQty(1)">+</button>
                  </div>
                </div>

                <div class="product-modal-actions">
                  <button type="button" id="detailAddToCartBtn" class="btn-add-cart">+ Add To Cart</button>
                  <button type="button" id="detailBuyNowBtn" class="btn-buy-now">⚡ Buy Now</button>
                </div>
              </div>
            </div>

            <!-- Customer Reviews & Real Photos Section -->
            <div id="detailReviewsSection" style="margin-top: 30px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <div>
                  <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700;">Verified Customer Feedback</span>
                  <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #fff; margin: 3px 0 0 0;">Customer Reviews &amp; Photos</h3>
                  <div id="detailReviewsSummary" style="font-size: 13px; color: var(--gold-light); margin-top: 4px;">Loading reviews...</div>
                </div>
                <button type="button" class="secondary-button" style="padding: 9px 18px; font-size: 12.5px; color: var(--gold-light); border-color: rgba(217,164,65,0.5); display: inline-flex; align-items: center; gap: 6px;" onclick="openUniversalProductReviewModal()">
                  <span>✍️</span> Write a Review &amp; Add Photo
                </button>
              </div>
              <div id="detailReviewsList" style="display: flex; flex-direction: column; gap: 12px; max-height: 320px; overflow-y: auto; padding-right: 6px;">
                <div style="text-align: center; padding: 25px; color: #888;">Loading verified customer reviews...</div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHtml);
      modal = document.getElementById("productDetailModal");

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeProductDetailModal();
      });
    }

    currentDetailProduct = product;

    // Populate Details
    const mainImg = document.getElementById("detailMainImg");
    const thumbsContainer = document.getElementById("detailThumbnails");
    const title = document.getElementById("detailTitle");
    const sku = document.getElementById("detailSku");
    const price = document.getElementById("detailPrice");
    const mrp = document.getElementById("detailMrp");
    const weight = document.getElementById("detailWeight");
    const desc = document.getElementById("detailDesc");
    const qtyEl = document.getElementById("detailQty");

    if (mainImg) mainImg.src = product.image || "images/garam-masala.jpeg";
    if (title) title.textContent = product.name;
    if (sku) sku.textContent = `SKU: ${product.sku || "OJ-01"} | FSSAI Lic. 3025120612245599988`;
    if (price) price.textContent = `₹${product.selling_price || product.price}`;
    if (mrp) mrp.textContent = product.mrp ? `₹${product.mrp}` : "₹249";
    if (weight) weight.textContent = product.weight || "NET WEIGHT 500g";
    if (desc) desc.textContent = product.description;
    if (qtyEl) qtyEl.textContent = "1";

    // Load customer reviews for this specific product
    loadProductDetailReviews(product.id, product.name);

    // Thumbnails
    const images = (product.images && product.images.length > 0) ? product.images : [product.image];
    if (thumbsContainer) {
      thumbsContainer.innerHTML = images
        .map(
          (img, idx) => `
          <img src="${img}" class="product-thumb ${idx === 0 ? "active" : ""}" alt="Thumbnail" onclick="switchDetailImage('${img}', this)" onerror="this.src='images/garam-masala.jpeg'">
        `
        )
        .join("");
    }

    // Button actions
    const addBtn = document.getElementById("detailAddToCartBtn");
    const buyBtn = document.getElementById("detailBuyNowBtn");

    if (addBtn) {
      addBtn.onclick = () => {
        const qty = parseInt(document.getElementById("detailQty")?.textContent || "1", 10);
        window.cart.addItem(product, qty);
        closeProductDetailModal();
        window.cart.openDrawer();
      };
    }

    if (buyBtn) {
      buyBtn.onclick = () => {
        const qty = parseInt(document.getElementById("detailQty")?.textContent || "1", 10);
        window.cart.addItem(product, qty);
        closeProductDetailModal();
        const target = isLocalFile ? "checkout.html" : "/checkout";
        safeNavigate(target, "#checkout");
      };
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  window.closeProductDetailModal = function () {
    const modal = document.getElementById("productDetailModal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
  };

  window.switchDetailImage = function (src, el) {
    const mainImg = document.getElementById("detailMainImg");
    if (mainImg) mainImg.src = src;
    document.querySelectorAll(".product-thumb").forEach((t) => t.classList.remove("active"));
    el?.classList.add("active");
  };

  window.changeDetailQty = function (change) {
    const qtyEl = document.getElementById("detailQty");
    if (!qtyEl) return;
    let qty = parseInt(qtyEl.textContent, 10) || 1;
    qty = Math.max(1, Math.min(50, qty + change));
    qtyEl.textContent = qty;
  };

  // Review management for Product Detail & Universal Reviews
  let universalReviewRating = 5;
  let universalReviewImageBase64 = null;

  async function loadProductDetailReviews(productId, productName) {
    const badgeEl = document.getElementById("detailRatingBadge");
    const summaryEl = document.getElementById("detailReviewsSummary");
    const listEl = document.getElementById("detailReviewsList");

    if (badgeEl) badgeEl.innerHTML = `<span style="color:var(--gold); font-size: 14px;">★★★★★</span> <span style="font-weight: 700; color: #fff;">4.9 / 5</span> <span style="color: #888;">(Loading...)</span>`;
    if (summaryEl) summaryEl.textContent = "Loading verified customer reviews...";
    if (listEl) listEl.innerHTML = `<div style="text-align: center; padding: 25px; color: #888;">Fetching verified customer reviews...</div>`;

    try {
      const res = await apiRequest(`/api/reviews/product/${productId}`);
      if (res && res.success) {
        const avg = res.summary && res.summary.average_rating ? Number(res.summary.average_rating).toFixed(1) : "5.0";
        const total = res.summary && typeof res.summary.total_reviews === "number" ? res.summary.total_reviews : (res.reviews ? res.reviews.length : 0);
        const rounded = Math.round(Number(avg)) || 5;
        const starsHtml = "★".repeat(Math.max(1, Math.min(5, rounded))) + "☆".repeat(5 - Math.max(1, Math.min(5, rounded)));

        if (badgeEl) {
          badgeEl.innerHTML = `<span style="color:var(--gold); font-size: 14px; letter-spacing: 2px;">${starsHtml}</span> <span style="font-weight: 700; color: #fff;">${avg} / 5</span> <span style="color: #888;">(${total} ${total === 1 ? 'review' : 'reviews'})</span>`;
        }

        if (summaryEl) {
          summaryEl.innerHTML = `<strong>${avg} ★ Verified Rating</strong> &bull; Based on ${total} authentic customer review${total === 1 ? '' : 's'}`;
        }

        if (listEl) {
          if (!res.reviews || res.reviews.length === 0) {
            listEl.innerHTML = `
              <div style="text-align: center; padding: 30px 15px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px dashed rgba(255,255,255,0.1);">
                <p style="font-size: 26px; margin-bottom: 6px;">✨</p>
                <p style="color: #fff; font-size: 14px; font-weight: 600;">Be the first to review ${productName}!</p>
                <p style="color: #888; font-size: 12px; margin-top: 4px;">Share your cooking experience and real photos of your dish or spice packet.</p>
              </div>
            `;
          } else {
            listEl.innerHTML = res.reviews.map(r => {
              const rRating = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5));
              const rStars = "★".repeat(rRating) + "☆".repeat(5 - rRating);
              const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent";
              const imgHtml = r.image_url ? `
                <div style="margin-top: 10px;">
                  <a href="${r.image_url}" target="_blank" rel="noopener noreferrer">
                    <img src="${r.image_url}" alt="Customer photo for ${r.product_name || productName}" style="max-height: 120px; max-width: 100%; border-radius: 6px; border: 1px solid var(--gold); object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.5);" onerror="this.style.display='none'">
                  </a>
                  <div style="font-size: 11px; color: var(--gold-light); margin-top: 4px;">📸 Real Customer Photo &bull; Click to enlarge</div>
                </div>
              ` : '';

              return `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="color: #fff; font-size: 13.5px;">${r.customer_name || "Verified Customer"}</strong>
                        ${r.is_verified_buyer ? '<span style="background: rgba(46,125,50,0.25); color: #81c784; border: 1px solid rgba(46,125,50,0.5); font-size: 10.5px; padding: 1px 6px; border-radius: 10px; font-weight: 600;">✓ Verified Buyer</span>' : ''}
                      </div>
                      <div style="color: var(--gold); font-size: 13px; margin: 3px 0; letter-spacing: 2px;">${rStars} <span style="color: #888; font-size: 11px; margin-left: 6px; letter-spacing: 0;">${dateStr}</span></div>
                    </div>
                  </div>
                  ${r.review_title ? `<div style="color: var(--gold-light); font-weight: 600; font-size: 13px; margin-top: 4px;">${r.review_title}</div>` : ''}
                  <p style="color: #ccc; font-size: 12.5px; line-height: 1.45; margin: 6px 0 0 0;">${r.review_text || ""}</p>
                  ${imgHtml}
                </div>
              `;
            }).join("");
          }
        }
      }
    } catch (err) {
      if (summaryEl) summaryEl.textContent = "Verified customer rating: 5.0 ★";
      if (listEl) {
        listEl.innerHTML = `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 14px;">
            <div style="color: var(--gold); letter-spacing: 2px;">★★★★★</div>
            <strong style="color: #fff; font-size: 13px;">Ganesh K. <span style="color: #81c784; font-size: 11px;">✓ Verified Buyer</span></strong>
            <p style="color: #ccc; font-size: 12px; margin-top: 4px;">Incredible aroma and authentic flavour from Malegaon. Best spices in Maharashtra!</p>
          </div>
        `;
      }
    }
  }
  window.loadProductDetailReviews = loadProductDetailReviews;

  window.openUniversalProductReviewModal = function (pId, pName) {
    const product = currentDetailProduct || (pId ? dynamicProducts.find(p => p.id === parseInt(pId, 10)) : null) || dynamicProducts[0];
    const targetId = product ? product.id : 1;

    let modal = document.getElementById("universalReviewModal");
    if (!modal) {
      const modalHtml = `
        <div id="universalReviewModal" class="modal" style="display: none; z-index: 10000;">
          <div class="product-modal-dialog" style="max-width: 520px; padding: 24px; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
              <div>
                <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700;">CUSTOMER FEEDBACK</span>
                <h3 id="uRevModalTitle" style="font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #fff; margin: 3px 0 0 0;">Review Your Spices</h3>
              </div>
              <button type="button" class="modal-close" style="position: static;" onclick="closeUniversalReviewModal()">&times;</button>
            </div>

            <form id="uRevForm" onsubmit="submitUniversalReview(event)">
              <input type="hidden" id="uRevProductId" value="${targetId}">
              
              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Product Blend</label>
                <select id="uRevProductSelect" onchange="document.getElementById('uRevProductId').value = this.value" style="width: 100%; background: #1c1c1c; border: 1px solid rgba(217,164,65,0.3); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px;">
                  ${dynamicProducts.map(p => `<option value="${p.id}" ${p.id === targetId ? "selected" : ""}>${p.name}</option>`).join("")}
                </select>
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Your Overall Rating</label>
                <div id="uStarPicker" style="font-size: 30px; color: var(--gold); cursor: pointer; user-select: none; letter-spacing: 6px;">
                  <span data-star="1" onclick="setUniversalRating(1)">★</span><span data-star="2" onclick="setUniversalRating(2)">★</span><span data-star="3" onclick="setUniversalRating(3)">★</span><span data-star="4" onclick="setUniversalRating(4)">★</span><span data-star="5" onclick="setUniversalRating(5)">★</span>
                </div>
                <div id="uRatingDesc" style="font-size: 12px; color: var(--gold-light); font-weight: 600; margin-top: 3px;">5 - Outstanding Flavour &amp; Aroma!</div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Your Name *</label>
                  <input type="text" id="uRevName" placeholder="Enter your full name" required style="width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px;">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Mobile / Phone (Optional)</label>
                  <input type="tel" id="uRevPhone" placeholder="For verified badge" style="width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px;">
                </div>
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Order ID (Optional)</label>
                <input type="text" id="uRevOrderId" placeholder="Enter your Order ID (optional)" style="width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px;">
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Review Headline *</label>
                <input type="text" id="uRevTitle" placeholder="e.g. Rich colour and pure aroma in my curry!" required style="width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px;">
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Your Review &amp; Cooking Experience *</label>
                <textarea id="uRevText" rows="3" placeholder="Tell us how Ojaswi spices tasted in your home cooking..." required style="width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 10px; color: #fff; font-size: 13.5px; resize: vertical;"></textarea>
              </div>

              <div style="margin-bottom: 18px;">
                <label style="display: block; font-size: 12px; color: #aaa; margin-bottom: 5px;">Upload Product / Cooked Dish Photo (Optional)</label>
                <div style="background: #141414; border: 1px dashed rgba(217,164,65,0.4); border-radius: 6px; padding: 14px; text-align: center;">
                  <input type="file" id="uRevImageFile" accept="image/*" onchange="previewUniversalReviewImage(this)" style="display: none;">
                  <div id="uRevUploadPrompt">
                    <button type="button" class="secondary-button" style="padding: 7px 14px; font-size: 12px;" onclick="document.getElementById('uRevImageFile').click()">
                      📸 Choose Photo / Take Camera Picture
                    </button>
                    <p style="font-size: 11px; color: #777; margin: 6px 0 0 0;">Snap your spice packet or your cooked dish</p>
                  </div>
                  <div id="uRevPreviewContainer" style="display: none; margin-top: 10px;">
                    <img id="uRevPreviewImg" src="" style="max-height: 120px; max-width: 100%; border-radius: 6px; border: 1px solid var(--gold);">
                    <button type="button" onclick="removeUniversalReviewImage()" style="display: block; margin: 6px auto 0; background: none; border: none; color: #ff5252; font-size: 11.5px; cursor: pointer;">Remove Photo ✕</button>
                  </div>
                </div>
              </div>

              <button type="submit" id="btnSubmitUReview" class="primary-button" style="width: 100%; padding: 13px; font-weight: 700;">
                POST VERIFIED REVIEW
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHtml);
      modal = document.getElementById("universalReviewModal");

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeUniversalReviewModal();
      });
    }

    const select = document.getElementById("uRevProductSelect");
    if (select) select.value = String(targetId);
    const idInput = document.getElementById("uRevProductId");
    if (idInput) idInput.value = String(targetId);

    // Auto-fill logged in user info if available
    try {
      const u = safeLocalStorage.getItem("ojaswi_user");
      if (u) {
        const parsed = JSON.parse(u);
        const nameInput = document.getElementById("uRevName");
        const phoneInput = document.getElementById("uRevPhone");
        if (nameInput && !nameInput.value) nameInput.value = parsed.name || "";
        if (phoneInput && !phoneInput.value) phoneInput.value = parsed.phone || "";
      }
    } catch (e) {}

    setUniversalRating(5);
    modal.style.display = "flex";
  };

  window.closeUniversalReviewModal = function () {
    const modal = document.getElementById("universalReviewModal");
    if (modal) modal.style.display = "none";
  };

  window.setUniversalRating = function (rating) {
    universalReviewRating = rating;
    const stars = document.querySelectorAll("#uStarPicker span");
    const desc = document.getElementById("uRatingDesc");
    const descriptions = {
      1: "1 - Disappointed",
      2: "2 - Average Quality",
      3: "3 - Good Standard Blend",
      4: "4 - Very Flavourful & Fresh",
      5: "5 - Outstanding Flavour & Aroma!"
    };

    stars.forEach((star, idx) => {
      star.style.color = (idx < rating) ? "var(--gold)" : "#444";
      star.textContent = (idx < rating) ? "★" : "☆";
    });

    if (desc) desc.textContent = descriptions[rating] || `${rating} Stars`;
  };

  window.previewUniversalReviewImage = function (input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        universalReviewImageBase64 = e.target.result;
        const preview = document.getElementById("uRevPreviewImg");
        const prompt = document.getElementById("uRevUploadPrompt");
        const container = document.getElementById("uRevPreviewContainer");
        if (preview) preview.src = e.target.result;
        if (prompt) prompt.style.display = "none";
        if (container) container.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  };

  window.removeUniversalReviewImage = function () {
    universalReviewImageBase64 = null;
    const input = document.getElementById("uRevImageFile");
    const prompt = document.getElementById("uRevUploadPrompt");
    const container = document.getElementById("uRevPreviewContainer");
    if (input) input.value = "";
    if (prompt) prompt.style.display = "block";
    if (container) container.style.display = "none";
  };

  window.submitUniversalReview = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSubmitUReview");
    const productId = document.getElementById("uRevProductId")?.value || "1";
    const orderId = document.getElementById("uRevOrderId")?.value.trim() || "";
    const customerName = document.getElementById("uRevName")?.value.trim();
    const customerPhone = document.getElementById("uRevPhone")?.value.trim() || "";
    const reviewTitle = document.getElementById("uRevTitle")?.value.trim();
    const reviewText = document.getElementById("uRevText")?.value.trim();

    if (!customerName || !reviewText) {
      showToast("Please enter your name and review comments.", "error");
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "POSTING REVIEW...";
      }

      const payload = {
        product_id: parseInt(productId, 10),
        order_id: orderId,
        rating: universalReviewRating,
        customer_name: customerName,
        customer_phone: customerPhone,
        review_title: reviewTitle,
        review_text: reviewText,
        image_base64: universalReviewImageBase64
      };

      const res = await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showToast(res.message || "Thank you! Your review and spice photo have been posted.", "success");
      closeUniversalReviewModal();

      // Refresh reviews in product modal if open
      loadProductDetailReviews(parseInt(productId, 10), "");

      // Reset form
      if (document.getElementById("uRevTitle")) document.getElementById("uRevTitle").value = "";
      if (document.getElementById("uRevText")) document.getElementById("uRevText").value = "";
      if (document.getElementById("uRevOrderId")) document.getElementById("uRevOrderId").value = "";
      removeUniversalReviewImage();

    } catch (err) {
      showToast(err.message || "Failed to post review. Please try again.", "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "POST VERIFIED REVIEW";
      }
    }
  };

  // =========================================================
  // 6. AUTHENTICATION STATUS HEADER SYNC
  // =========================================================
  async function checkAuthStatus() {
    try {
      const res = await apiRequest("/api/auth/me");
      const authNavContainer = document.getElementById("authNavContainer");
      const tabAccount = document.getElementById("tabAccount");
      const tabAccountLabel = document.getElementById("tabAccountLabel");
      const drawerLogin = document.getElementById("drawerLoginLink");
      const btnNavAccount = document.getElementById("btnNavAccount");
      const btnNavLogin = document.getElementById("btnNavLogin");
      const btnNavLogout = document.getElementById("btnNavLogout");

      const loginLink = resolveTargetUrl("login.html");
      const accountLink = resolveTargetUrl("account.html");

      if (res && res.isAuthenticated && res.user) {
        const displayName = res.user.name ? res.user.name.split(" ")[0] : "Account";

        const html = `
          <a href="${accountLink}" onclick="window.goToAccount(event)" class="nav-order nav-auth-btn" title="${res.user.name || res.user.phone || res.user.email}">
            <span>👤</span> <span class="nav-auth-label">${displayName}</span>
          </a>
        `;
        if (authNavContainer) authNavContainer.innerHTML = html;
        if (drawerLogin) {
          drawerLogin.innerHTML = `<span>👤</span> ${displayName}'s Account`;
          drawerLogin.setAttribute("href", accountLink);
          drawerLogin.onclick = (e) => window.goToAccount(e);
        }
        if (tabAccount) {
          tabAccount.setAttribute("href", accountLink);
          tabAccount.onclick = (e) => window.goToAccount(e);
          if (tabAccountLabel) tabAccountLabel.textContent = displayName || "Account";
        }
        if (btnNavAccount) {
          btnNavAccount.textContent = "👤 " + displayName;
          btnNavAccount.setAttribute("href", accountLink);
          btnNavAccount.title = res.user.name || res.user.phone || res.user.email;
        }
        if (btnNavLogin) btnNavLogin.style.display = "none";
        if (btnNavLogout) btnNavLogout.style.display = "inline-block";
      } else {
        const html = `
          <a href="${loginLink}" onclick="window.goToLogin(event)" class="nav-order nav-auth-btn" title="Customer Login / Account">
            <span>👤</span> <span class="nav-auth-label">Login</span>
          </a>
        `;
        if (authNavContainer) authNavContainer.innerHTML = html;
        if (drawerLogin) {
          drawerLogin.innerHTML = `<span>👤</span> Customer Account / Login`;
          drawerLogin.setAttribute("href", loginLink);
          drawerLogin.onclick = (e) => window.goToLogin(e);
        }
        if (tabAccount) {
          tabAccount.setAttribute("href", accountLink);
          tabAccount.onclick = (e) => window.goToAccount(e);
          if (tabAccountLabel) tabAccountLabel.textContent = "Account";
        }
        if (btnNavAccount) {
          btnNavAccount.textContent = "My Account";
          btnNavAccount.setAttribute("href", accountLink);
          btnNavAccount.title = "Customer Account Dashboard";
        }
        if (btnNavLogin) {
          btnNavLogin.style.display = "inline-block";
          btnNavLogin.setAttribute("href", loginLink);
        }
        if (btnNavLogout) btnNavLogout.style.display = "none";
      }
    } catch (err) {
      console.warn("[checkAuthStatus]:", err);
    }
  }
  window.checkAuthStatus = checkAuthStatus;

  async function handleLogoutGlobal() {
    try {
      if (window.safeLocalStorage) {
        window.safeLocalStorage.removeItem("ojaswi_user");
        window.safeLocalStorage.removeItem("ojaswi_token");
        window.safeLocalStorage.removeItem("ojaswi_customer_phone");
        window.safeLocalStorage.removeItem("ojaswi_customer_name");
        window.safeLocalStorage.removeItem("ojaswi_customer_orders");
        window.safeLocalStorage.removeItem("ojaswi_last_order");
      }
      localStorage.removeItem("ojaswi_user");
      localStorage.removeItem("ojaswi_token");
      localStorage.removeItem("ojaswi_customer_phone");
      localStorage.removeItem("ojaswi_customer_name");
      localStorage.removeItem("ojaswi_customer_orders");
      localStorage.removeItem("ojaswi_last_order");
    } catch (_) {}

    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (_) {}

    if (window.cart && typeof window.cart.switchUser === "function") {
      window.cart.switchUser(null);
    }

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "info");
    }

    checkAuthStatus();
  }
  window.handleLogoutGlobal = handleLogoutGlobal;
  if (!window.handleLogout) {
    window.handleLogout = handleLogoutGlobal;
  }

  // =========================================================
  // 7. ORDER MORE SPICES NAVIGATION HELPER
  // =========================================================
  function goToStoreProducts(e) {
    if (e && e.preventDefault) e.preventDefault();
    const prodSec = document.getElementById("products");
    if (prodSec) {
      prodSec.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", "#products");
        }
      } catch (err) {}
      return;
    }
    try {
      safeSessionStorage.setItem("ojaswi_scroll_to_products", "true");
    } catch (err) {}
    const target = isStaticOrLocalMode() ? "index.html#products" : "/#products";
    safeNavigate(target, "#products");
  }
  window.goToStoreProducts = goToStoreProducts;

  // =========================================================
  // 8. INITIALIZE ON DOM READY
  // =========================================================
  function onReady() {
    checkAuthStatus();
    loadProductsCatalog();

    function scrollToProducts() {
      const prodSec = document.getElementById("products");
      if (prodSec) {
        prodSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Auto-scroll to products when requested from "Order More Spices" or #products hash safely
    let shouldScroll = false;
    try {
      shouldScroll = (window.location.hash === "#products") || (safeSessionStorage.getItem("ojaswi_scroll_to_products") === "true");
    } catch (e) {}

    if (shouldScroll) {
      try { safeSessionStorage.removeItem("ojaswi_scroll_to_products"); } catch (err) {}
      setTimeout(scrollToProducts, 100);
      setTimeout(scrollToProducts, 450);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#products") {
        scrollToProducts();
      }
    });

    // Fix absolute links when running in local file, Live Server, or static preview
    if (isStaticOrLocalMode()) {
      document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("sms:") || href.startsWith("javascript:") || href.startsWith("#")) {
          return;
        }

        if (href === "/login" || href.startsWith("/login?")) {
          link.setAttribute("href", href.replace(/^\/login/, "login.html"));
        } else if (href === "/account" || href.startsWith("/account?")) {
          link.setAttribute("href", href.replace(/^\/account/, "account.html"));
        } else if (href === "/checkout" || href.startsWith("/checkout?")) {
          link.setAttribute("href", href.replace(/^\/checkout/, "checkout.html"));
        } else if (href === "/orders" || href.startsWith("/orders?")) {
          link.setAttribute("href", href.replace(/^\/orders/, "orders.html"));
        } else if (href === "/order-confirmation" || href.startsWith("/order-confirmation?")) {
          link.setAttribute("href", href.replace(/^\/order-confirmation/, "order-confirmation.html"));
        } else if (href === "/contact-us" || href.startsWith("/contact-us?")) {
          link.setAttribute("href", href.replace(/^\/contact-us/, "contact-us.html"));
        } else if (href === "/privacy-policy" || href.startsWith("/privacy-policy?")) {
          link.setAttribute("href", href.replace(/^\/privacy-policy/, "privacy-policy.html"));
        } else if (href === "/terms-and-conditions" || href.startsWith("/terms-and-conditions?")) {
          link.setAttribute("href", href.replace(/^\/terms-and-conditions/, "terms-and-conditions.html"));
        } else if (href === "/refund-policy" || href.startsWith("/refund-policy?")) {
          link.setAttribute("href", href.replace(/^\/refund-policy/, "refund-policy.html"));
        } else if (href === "/shipping-policy" || href.startsWith("/shipping-policy?")) {
          link.setAttribute("href", href.replace(/^\/shipping-policy/, "shipping-policy.html"));
        } else if (href === "/cancellation-policy" || href.startsWith("/cancellation-policy?")) {
          link.setAttribute("href", href.replace(/^\/cancellation-policy/, "cancellation-policy.html"));
        } else if (href === "/#products" || href === "#products") {
          link.setAttribute("href", "index.html#products");
        } else if (href === "/") {
          link.setAttribute("href", "index.html");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

})(window, document);
