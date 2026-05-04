// =======================================
// DYNAMIC PRODUCTS LOADER
// Firebase se products load karta hai
// Pages: bundle, ai-editing, social
// Usage: <script type="module" src="js/products-loader.js"></script>
// =======================================

import { db } from "./firebase-init.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  increment,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// -------------------------------------------------------
// Detect which page we are on
// -------------------------------------------------------
const path      = window.location.pathname.split("/").pop() || "index.html";
const pageMap   = {
  "index.html":      "bundle",
  "ai-editing.html": "ai-editing",
  "social.html":     "social"
};
const PAGE_KEY = pageMap[path] || null;

if (!PAGE_KEY) {
  console.warn("products-loader: Unknown page, skipping.");
} else {
  loadDynamicProducts(PAGE_KEY);
}

// -------------------------------------------------------
// LOAD PRODUCTS FROM FIREBASE
// -------------------------------------------------------
async function loadDynamicProducts(pageKey) {
  try {
    const q        = query(
      collection(db, "products"),
      where("page",   "==", pageKey),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return; // No dynamic products — static content stays

    // Find inject point
    const container = getContainer(pageKey);
    if (!container) return;

    // Separator before dynamic products
    const sep = document.createElement("div");
    sep.className = "section-title";
    sep.innerHTML = `
      <span class="section-badge">🆕 New</span>
      <h2>New Arrivals</h2>
      <p>Added by admin • Fresh products</p>
    `;
    container.appendChild(sep);

    snapshot.forEach(docSnap => {
      const p  = docSnap.data();
      const id = docSnap.id;
      const card = buildCard(p, id, pageKey);
      container.appendChild(card);
    });

    // Attach details toggle to new cards
    attachDetailsToggle();

  } catch (err) {
    console.error("products-loader error:", err);
  }
}

// -------------------------------------------------------
// FIND CONTAINER to inject cards into
// -------------------------------------------------------
function getContainer(pageKey) {
  if (pageKey === "bundle") {
    // index.html: inject inside .page-wrap before trending section
    const wrap = document.querySelector(".page-wrap");
    return wrap || document.body;
  }
  if (pageKey === "ai-editing") {
    const wrap = document.querySelector(".ai-wrapper");
    return wrap || document.body;
  }
  if (pageKey === "social") {
    // Social page has "Coming Soon" — we replace it or inject after
    const wrap = document.querySelector(".social-wrapper");
    if (wrap) {
      // Remove "coming soon" block if we have products
      const cs = wrap.querySelector(".coming-soon");
      if (cs) cs.remove();
      return wrap;
    }
    return document.body;
  }
  return document.body;
}

// -------------------------------------------------------
// BUILD CARD — matches existing site style
// -------------------------------------------------------
function buildCard(p, id, pageKey) {
  const hasDiscount = p.discountPrice && p.discountPrice > 0;
  const imageUrl    = p.image || (p.imageName ? `assets/${p.imageName}` : "assets/default.jpg");
  const safeId      = "dyn-" + id;

  if (pageKey === "bundle") {
    // Bundle style (bundle-card)
    const div = document.createElement("div");
    div.className = "bundle-card";
    div.innerHTML = `
      <div class="card-top">
        <img src="${imageUrl}" class="card-img" alt="${p.name}" onerror="this.src='assets/default.jpg'">
        <div class="card-text">
          <div class="card-badge">Digital</div>
          <h3>${p.name}</h3>
          ${p.desc ? `<p style="font-size:12px;color:#666;margin:4px 0;">${p.desc}</p>` : ""}
          <div class="price-row">
            ${hasDiscount ? `<del>₹${p.discountPrice}</del>` : ""}
            <span class="price-now">₹${p.price}</span>
          </div>
          <p class="urgent">⚡ Digital Product • Instant Delivery</p>
          <div class="btn-row">
            <button class="details-btn" onclick="toggleDetails('${safeId}')">Details ▾</button>
            <button class="buy-btn" id="buy-${id}" onclick="buyProduct('${id}')">Buy Now</button>
          </div>
        </div>
      </div>
      <div class="details-box" id="${safeId}">
        <div class="details-grid">
          <span>📦 Type</span><span>Digital Product</span>
          ${p.desc ? `<span>📝 Details</span><span>${p.desc}</span>` : ""}
          <span>💰 Price</span><span>₹${p.price}</span>
          <span>🚀 Delivery</span><span>Instant</span>
        </div>
      </div>
    `;
    return div;
  }

  if (pageKey === "ai-editing") {
    // AI Editing style (ai-card)
    const div = document.createElement("div");
    div.className = "ai-card";
    div.innerHTML = `
      <img src="${imageUrl}" class="ai-image" alt="${p.name}" onerror="this.src='assets/default.jpg'">
      <div class="ai-content">
        <h3>${p.name}</h3>
        <p class="price">
          ${hasDiscount ? `<del>₹${p.discountPrice}</del>` : ""}
          <strong>₹${p.price} Only</strong>
        </p>
        ${p.desc ? `<p style="font-size:13px;color:#555;margin:8px 0;">${p.desc}</p>` : ""}
        <button class="details-btn">View Details</button>
        <div class="details-box">
          <p>📦 Type: Digital Product</p>
          <hr style="margin:8px 0;opacity:.3;">
          ${p.desc ? `<p>${p.desc}</p><hr style="margin:8px 0;opacity:.3;">` : ""}
          <p>💰 Price: ₹${p.price}</p>
          <p>🚀 Delivery: Instant</p>
        </div>
        <button class="buy-btn" id="buy-${id}" onclick="buyProduct('${id}')">Buy Now</button>
      </div>
    `;
    return div;
  }

  if (pageKey === "social") {
    // Social style (glass-card style)
    const div = document.createElement("div");
    div.style.cssText = `
      background:#fff;
      border-radius:20px;
      padding:16px;
      margin:16px auto;
      max-width:420px;
      box-shadow:0 8px 24px rgba(0,0,0,0.1);
      text-align:center;
    `;
    div.innerHTML = `
      ${p.image ? `<img src="${imageUrl}" style="width:100%;border-radius:14px;margin-bottom:12px;" alt="${p.name}" onerror="this.src='assets/default.jpg'">` : ""}
      <h3 style="font-size:17px;font-weight:700;margin-bottom:6px;">${p.name}</h3>
      ${p.desc ? `<p style="font-size:13px;color:#666;margin-bottom:10px;">${p.desc}</p>` : ""}
      <p style="margin:8px 0;">
        ${hasDiscount ? `<del style="color:#ff6b6b;margin-right:6px;">₹${p.discountPrice}</del>` : ""}
        <strong style="font-size:16px;">₹${p.price} Only</strong>
      </p>
      <button onclick="buyProduct('${id}')" style="
        width:100%;padding:13px;border-radius:30px;
        background:#ffd400;border:none;
        font-weight:700;font-size:15px;cursor:pointer;
        margin-top:10px;
      ">Buy Now</button>
    `;
    return div;
  }

  return document.createElement("div");
}

// -------------------------------------------------------
// DETAILS TOGGLE (for ai-editing style)
// -------------------------------------------------------
function attachDetailsToggle() {
  document.querySelectorAll(".details-btn").forEach(btn => {
    // Avoid re-binding
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      const box = this.nextElementSibling;
      if (!box) return;
      const isOpen = box.style.display === "block";
      box.style.display = isOpen ? "none" : "block";
      this.textContent  = isOpen ? "View Details" : "Hide Details";
    });
  });
}
