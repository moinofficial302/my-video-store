/* ===================================================
   🚀 MY ORDERS – FINAL FIXED (SUBCOLLECTION VERSION)
   Jarvis Ultra Stable 💛
=================================================== */

import { auth, db } from "./firebase-init.js";

import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const ordersList = document.getElementById("ordersList");


// ===================================================
// LOAD ORDERS (CORRECT PATH)
// ===================================================
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    ordersList.innerHTML = "<p>Loading orders...</p>";

    // ✅ FIXED PATH
    const q = query(
      collection(db, "orders", user.uid, "items"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    ordersList.innerHTML = "";

    if (snap.empty) {
      ordersList.innerHTML = `
        <div class="order-card">
          <h3>No Orders Found 😢</h3>
          <p>You haven't purchased anything yet.</p>
        </div>
      `;
      return;
    }

    snap.forEach(doc => {

      const data = doc.data();

      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <h3>${data.name}</h3>
        <p>Paid: ${data.price} Coins</p>
        <button class="open-btn">Open Product</button>
      `;

      card.querySelector(".open-btn")
        .onclick = () => window.open(data.link, "_blank");

      ordersList.appendChild(card);
    });

  }
  catch (err) {
    console.error(err);
    ordersList.innerHTML = "<p>Error loading orders ❌</p>";
  }

});
