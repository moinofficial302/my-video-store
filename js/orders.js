/* ===================================================
   🚀 MY ORDERS – AKANS FINAL (Firebase v10 Modular)
   Jarvis Safe Version 💛
=================================================== */

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


/* ===================================================
   LOAD ORDERS
=================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    ordersList.innerHTML = "<p>Loading orders...</p>";

    const q = query(
      collection(db, "orders"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    ordersList.innerHTML = "";

    /* no orders */
    if (snap.empty) {
      ordersList.innerHTML = `
        <div class="order-card">
          <h3>No Orders Found 😢</h3>
          <p>You haven't purchased anything yet.</p>
        </div>
      `;
      return;
    }

    /* render orders */
    snap.forEach(d => {

      const data = d.data();

      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <h3>${data.name}</h3>
        <p>Paid: ${data.price} Coins</p>

        <button class="open-btn">
          Open Product
        </button>
      `;

      card.querySelector(".open-btn")
        .onclick = () => window.open(data.link, "_blank");

      ordersList.appendChild(card);
    });

  }
  catch (err) {

    console.error(err);

    ordersList.innerHTML = `
      <div class="order-card">
        <h3>Error ❌</h3>
        <p>Unable to load orders. Try again.</p>
      </div>
    `;
  }

});


