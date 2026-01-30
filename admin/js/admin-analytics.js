// =======================================
// ADMIN ANALYTICS DASHBOARD
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================================
// DOM
// =======================================
const analyticsBox = document.querySelector("#analytics .analytics-box");

// =======================================
// LOAD ANALYTICS
// =======================================
async function loadAnalytics() {
  try {
    // USERS
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsers = usersSnap.size;

    // ORDERS
    const ordersSnap = await getDocs(collection(db, "orders"));
    const totalOrders = ordersSnap.size;

    let totalCoins = 0;
    const productSales = {};

    ordersSnap.forEach(doc => {
      const data = doc.data();
      const coins = data.coins || 0;
      totalCoins += coins;

      const product = data.productName || "Unknown";
      productSales[product] = (productSales[product] || 0) + 1;
    });

    // TOP PRODUCT
    let topProduct = "N/A";
    let maxSales = 0;

    for (const p in productSales) {
      if (productSales[p] > maxSales) {
        maxSales = productSales[p];
        topProduct = p;
      }
    }

    // RENDER
    analyticsBox.innerHTML = `
      <div class="stat-card">
        <h3>Total Users</h3>
        <p>${totalUsers}</p>
      </div>

      <div class="stat-card">
        <h3>Total Orders</h3>
        <p>${totalOrders}</p>
      </div>

      <div class="stat-card">
        <h3>Total Revenue</h3>
        <p>₹${totalCoins}</p>
      </div>

      <div class="stat-card">
        <h3>Top Product</h3>
        <p>${topProduct}</p>
      </div>
    `;

  } catch (err) {
    console.error("Analytics error:", err);
    analyticsBox.innerHTML = "<p>❌ Analytics load failed</p>";
  }
}

// =======================================
// INIT
// =======================================
loadAnalytics();
