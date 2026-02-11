import { auth, db } from "./firebase-init.js";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const ordersList = document.getElementById("ordersList");


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    location.href = "login.html";
    return;
  }

  ordersList.innerHTML = "<p>Loading orders...</p>";

  let allOrders = [];

  try {

    // =========================
    // ⭐ NEW PATH
    // =========================
    const newSnap = await getDocs(
      query(
        collection(db, "orders", user.uid, "items"),
        orderBy("createdAt", "desc")
      )
    );

    newSnap.forEach(d => allOrders.push(d.data()));


    // =========================
    // ⭐ OLD PATH SUPPORT
    // =========================
    const oldSnap = await getDocs(
      query(
        collection(db, "orders"),
        where("uid", "==", user.uid)
      )
    );

    oldSnap.forEach(d => allOrders.push(d.data()));


    // =========================
    // RENDER
    // =========================
    ordersList.innerHTML = "";

    if (allOrders.length === 0) {
      ordersList.innerHTML = `
        <div class="order-card">
          <h3>No Orders Found 😢</h3>
        </div>
      `;
      return;
    }

    allOrders.forEach(data => {

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

  } catch (err) {

    console.error(err);
    ordersList.innerHTML = "<p>Error loading orders ❌</p>";
  }

});
