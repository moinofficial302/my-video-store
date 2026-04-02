// =======================================
// ADMIN COUPON SYSTEM (FINAL PERFECT)
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM
const couponsTable = document.getElementById("couponsTable");
const createBtn = document.getElementById("createCouponBtn");

// =======================================
// LOAD COUPONS
// =======================================
async function loadCoupons() {
  couponsTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "coupons"));

  if (snapshot.empty) {
    couponsTable.innerHTML = `
      <tr><td colspan="5">No Coupons Found</td></tr>
    `;
    return;
  }

  snapshot.forEach(docSnap => {

    const d = docSnap.data();

    // ✅ SAFE VALUES
    const coins = d.coins ?? d.value ?? 0;
    const limit = d.limit ?? 0;
    const used = d.used ?? 0;
    const active = d.active ?? false;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${coins}</td>
      <td>${limit}</td>
      <td>${used}</td>
      <td>
        <button onclick="toggleCoupon('${docSnap.id}', ${active})">
          ${active ? "Disable" : "Enable"}
        </button>
      </td>
    `;

    couponsTable.appendChild(tr);
  });
}

// =======================================
// CREATE COUPON
// =======================================
createBtn.addEventListener("click", async () => {

  const code = prompt("Coupon Code (e.g. AKANS50)");
  if (!code) return;

  const coins = Number(prompt("Coins to Add"));
  if (!coins || coins <= 0) {
    alert("Invalid coins value");
    return;
  }

  const limit = Number(prompt("Usage Limit"));
  if (!limit || limit <= 0) {
    alert("Invalid limit");
    return;
  }

  try {
    await setDoc(doc(db, "coupons", code.toUpperCase()), {

      // ✅ STORE BOTH (future safe)
      coins: coins,
      value: coins,

      limit: limit,
      used: 0,
      active: true,
      createdAt: serverTimestamp()
    });

    alert("Coupon Created Successfully ✅");
    loadCoupons();

  } catch (err) {
    console.error(err);
    alert("Error creating coupon");
  }
});

// =======================================
// ENABLE / DISABLE COUPON
// =======================================
window.toggleCoupon = async function (code, currentState) {

  try {

    await updateDoc(doc(db, "coupons", code), {
      active: !currentState
    });

    loadCoupons();

  } catch (err) {
    console.error(err);
    alert("Failed to update coupon");
  }
};

// INIT
loadCoupons();
