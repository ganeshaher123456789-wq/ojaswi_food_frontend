import { apiRequest, showToast } from "./api.js";
import { cart } from "./cart.js";

// Global cache for loaded products
let cachedProducts = [];

/**
 * Check authentication status and update header
 */
async function checkAuthStatus() {
  try {
    const res = await apiRequest("/api/auth/me");
    const authNavContainer = document.getElementById("authNavContainer");
    const mobileAuthContainer = document.getElementById("mobileAuthContainer");

    if (res.isAuthenticated && res.user) {
      const displayName = res.user.name ? res.user.name.split(" ")[0] : "Account";
      const isAdmin = res.user.role === "admin";
      const link = isAdmin ? "/admin" : "/account";

      const html = `
        <a href="${link}" class="account-link" title="${res.user.name || res.user.phone || res.user.email}">
          <span>👤</span> ${displayName} ${isAdmin ? "(Admin)" : ""}
        </a>
      `;

      if (authNavContainer) authNavContainer.innerHTML = html;
      if (mobileAuthContainer) mobileAuthContainer.innerHTML = html;
    } else {
      const html = `
        <a href="/login" class="nav-order" style="border-radius: 4px; font-weight: 600;">
          LOGIN / ACCOUNT
        </a>
      `;
      if (authNavContainer) authNavContainer.innerHTML = html;
      if (mobileAuthContainer) mobileAuthContainer.innerHTML = html;
    }
  } catch (err) {
    console.warn("Auth check note:", err.message);
  }
}

/**
 * Load products dynamically to ensure synchronized inventory and descriptions
 */
async function loadProductsCatalog() {
  try {
    const res = await apiRequest("/api/products");
    if (res.success && res.products) {
      cachedProducts = res.products;
    }
  } catch (err) {
    console.warn("Using inline products fallback:", err.message);
  }
}

/**
 * Open Rich Product Detail Modal
 */
window.openProductDetail = function(productId) {
  const product = cachedProducts.find((p) => p.id === productId) || {
    id: productId,
    name: "Ojaswi Premium Spice",
    price: 199,
    mrp: 249,
    weight: "NET WEIGHT 500g",
    description: "Authentic spice blend stone-ground in Malegaon, Maharashtra.",
    image: "images/garam-masala.jpeg",
    images: ["images/garam-masala.jpeg"],
    stock: 50
  };

  let modal = document.getElementById("productDetailModal");
  if (!modal) {
    const modalHtml = `
      <div id="productDetailModal" class="modal" style="display: none;">
        <div class="product-modal-dialog">
          <button class="modal-close" onclick="closeProductDetailModal()">&times;</button>
          <div class="product-detail-grid">
            <div>
              <img id="detailMainImg" class="product-gallery-main" src="" alt="Ojaswi Spice">
              <div id="detailThumbnails" class="product-thumbnails"></div>
            </div>
            <div>
              <div id="detailBadge" class="product-badge-origin">📍 52/2 Malegaon 423203</div>
              <h2 id="detailTitle" class="product-modal-title"></h2>
              <div id="detailSku" class="product-modal-sku"></div>
              <div class="product-modal-price">
                <span id="detailPrice"></span>
                <span id="detailMrp" class="product-modal-mrp"></span>
              </div>
              <p id="detailWeight" style="color: #aaa; font-size: 13px; margin-bottom: 12px;"></p>
              <p id="detailDesc" class="product-modal-desc"></p>
              
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <label style="font-size: 13px; color: #888;">Quantity:</label>
                <div class="cart-qty-ctrl" style="background: #1c1c1c; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                  <button class="cart-qty-btn" onclick="changeDetailQty(-1)">-</button>
                  <span id="detailQty" class="cart-qty-value" style="font-weight: 600;">1</span>
                  <button class="cart-qty-btn" onclick="changeDetailQty(1)">+</button>
                </div>
              </div>

              <div class="product-modal-actions">
                <button id="detailAddToCartBtn" class="btn-add-cart">+ Add To Cart</button>
                <button id="detailBuyNowBtn" class="btn-buy-now">⚡ Buy Now</button>
              </div>
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

  mainImg.src = product.image || "images/garam-masala.jpeg";
  mainImg.onerror = () => { mainImg.src = "images/garam-masala.jpeg"; };
  title.textContent = product.name;
  sku.textContent = product.sku ? `SKU: ${product.sku} | FSSAI Lic. 3025120612245599988` : "FSSAI Lic. 3025120612245599988";
  price.textContent = `₹${product.selling_price || product.price}`;
  mrp.textContent = product.mrp ? `₹${product.mrp}` : "";
  weight.textContent = product.weight || "NET WEIGHT 500g";
  desc.textContent = product.description || "Crafted with pure royal heritage spices in Malegaon.";
  qtyEl.textContent = "1";

  // Thumbnails
  const images = (product.images && product.images.length > 0) ? product.images : [product.image];
  thumbsContainer.innerHTML = images
    .map(
      (img, idx) => `
      <img src="${img}" class="product-thumb ${idx === 0 ? "active" : ""}" alt="Thumbnail" onclick="switchDetailImage('${img}', this)">
    `
    )
    .join("");

  // Button actions
  document.getElementById("detailAddToCartBtn").onclick = () => {
    const qty = parseInt(qtyEl.textContent, 10) || 1;
    cart.addItem(product, qty);
    closeProductDetailModal();
    cart.openDrawer();
  };

  document.getElementById("detailBuyNowBtn").onclick = () => {
    const qty = parseInt(qtyEl.textContent, 10) || 1;
    cart.addItem(product, qty);
    closeProductDetailModal();
    window.location.href = "/checkout";
  };

  modal.style.display = "flex";
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeProductDetailModal = function() {
  const modal = document.getElementById("productDetailModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.switchDetailImage = function(imgSrc, element) {
  const mainImg = document.getElementById("detailMainImg");
  if (mainImg) mainImg.src = imgSrc;
  document.querySelectorAll(".product-thumb").forEach((el) => el.classList.remove("active"));
  element.classList.add("active");
};

window.changeDetailQty = function(delta) {
  const qtyEl = document.getElementById("detailQty");
  let val = parseInt(qtyEl.textContent, 10) || 1;
  val = Math.max(1, Math.min(50, val + delta));
  qtyEl.textContent = val;
};

/**
 * Handle Contact Form submission to Backend API
 */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const subject = document.getElementById("subject")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    if (!name || !phone || !message) {
      alert("Please fill in Name, Phone Number, and Message.");
      return;
    }

    try {
      showToast("Sending your enquiry...", "info");
      const res = await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, subject, message })
      });

      showToast(res.message, "success");
      form.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  loadProductsCatalog();
  initContactForm();
});
