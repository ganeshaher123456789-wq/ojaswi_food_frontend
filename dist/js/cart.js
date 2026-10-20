import { showToast, apiRequest } from "./api.js";

const STORAGE_KEY = "ojaswi_cart_items";

class CartManager {
  constructor() {
    this.items = this.load();
    this.initDrawer();
    this.updateBadges();
    this.fetchRemoteCart();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Could not save cart:", e);
    }
    this.updateBadges();
    this.renderDrawer();
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items: this.items } }));
    this.syncWithBackend();
  }

  async syncWithBackend() {
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      await apiRequest("/api/cart/sync", {
        method: "POST",
        body: JSON.stringify({ items: this.items })
      });
    } catch (e) {
      // Background sync - ignore network errors
    }
  }

  async fetchRemoteCart() {
    try {
      const res = await apiRequest("/api/cart");
      if (res && res.success && Array.isArray(res.items) && res.items.length > 0) {
        if (!this.items || this.items.length === 0) {
          this.items = res.items;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
          } catch (e) {}
          this.updateBadges();
          this.renderDrawer();
          window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items: this.items } }));
        }
      }
    } catch (e) {
      // Ignore
    }
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
        image: product.image,
        weight: product.weight || "NET WEIGHT 500g",
        sku: product.sku || `OJ-${product.id}`,
        quantity: qty
      });
    }

    this.save();
    showToast(`Added ${product.name} to cart.`, "success");
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
  }

  removeItem(productId) {
    this.items = this.items.filter((i) => i.id !== productId);
    this.save();
    showToast("Item removed from cart.", "info");
  }

  clear() {
    this.items = [];
    this.save();
  }

  updateBadges() {
    const count = this.getCount();
    document.querySelectorAll(".cart-count-badge").forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  initDrawer() {
    // Drawer HTML injection if not already present
    if (!document.getElementById("cartDrawer")) {
      const drawerHtml = `
        <div id="cartDrawerOverlay" class="cart-drawer-overlay"></div>
        <aside id="cartDrawer" class="cart-drawer" aria-label="Shopping Cart">
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
            <a href="checkout.html" id="cartDrawerCheckoutBtn" class="cart-checkout-btn" style="display: block; text-decoration: none; text-align: center; box-sizing: border-box; cursor: pointer;">Proceed to Checkout</a>
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
        if (e && e.preventDefault) e.preventDefault();
        this.closeDrawer();
        const isLocal = window.location.protocol === "file:" ||
                        window.location.protocol === "about:" ||
                        window.location.pathname.endsWith(".html") ||
                        window.location.pathname.includes(".html") ||
                        window.location.pathname.includes("/public/") ||
                        (window.location.port && window.location.port !== "5000" && window.location.port !== "80" && window.location.port !== "443");
        const target = isLocal ? "checkout.html" : "/checkout";
        window.location.href = target;
      });
    }

    // Attach click listeners to all .cart-toggle-btn
    document.querySelectorAll(".cart-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    this.renderDrawer();
  }

  openDrawer() {
    this.renderDrawer();
    document.getElementById("cartDrawerOverlay")?.classList.add("active");
    document.getElementById("cartDrawer")?.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeDrawer() {
    document.getElementById("cartDrawerOverlay")?.classList.remove("active");
    document.getElementById("cartDrawer")?.classList.remove("active");
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
        <div class="cart-empty">
          <p style="font-size: 32px; margin-bottom: 10px;">🛍️</p>
          <p>Your cart is empty.</p>
          <a href="/#products" class="primary-button" style="display: inline-block; margin-top: 15px; padding: 8px 18px; font-size: 12px;" onclick="window.cart.closeDrawer()">Explore Spices</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = "₹0";
      if (totalEl) totalEl.textContent = "₹0";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
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
              <button class="cart-qty-btn" onclick="window.cart.updateQty(${item.id}, ${item.quantity - 1})">-</button>
              <span class="cart-qty-value">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="window.cart.updateQty(${item.id}, ${item.quantity + 1})">+</button>
              <button class="cart-remove-btn" onclick="window.cart.removeItem(${item.id})">Remove</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }
}

export const cart = new CartManager();
window.cart = cart;
