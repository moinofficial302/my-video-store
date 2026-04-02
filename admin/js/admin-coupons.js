// =======================================
// ADMIN COUPON SYSTEM (100% FINAL FIXED)
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
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

    const coins = Number(d.coins ?? d.value ?? 0);
    const limit = Number(d.limit ?? 0);
    const used = Number(d.used ?? 0);
    const active = d.active === true;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${coins}</td>
      <td>${limit}</td>
      <td>${used}</td>
      <td>
        <button onclick="toggleCoupon('${docSnap.id}', ${active ? "true" : "false"})">
          ${active ? "Disable" : "Enable"}
        </button>
      </td>
    `;

    couponsTable.appendChild(tr);
  });
}

// =======================================
// CREATE COUPON (SAFE)
// =======================================
createBtn.addEventListener("click", async () => {

  const codeInput = prompt("Coupon Code (e.g. AKANS50)");
  if (!codeInput) return;

  const code = codeInput.trim().toUpperCase();

  // 🔒 CHECK ALREADY EXISTS
  const existing = await getDoc(doc(db, "coupons", code));
  if (existing.exists()) {
    alert("Coupon already exists ❌");
    return;
  }

  // 🔒 COINS VALIDATION
  const coinsInput = prompt("Coins to Add");
  const coins = Number(coinsInput);

  if (isNaN(coins) || coins <= 0) {
    alert("Invalid coins value ❌");
    return;
  }

  // 🔒 LIMIT VALIDATION
  const limitInput = prompt("Usage Limit");
  const limit = Number(limitInput);

  if (isNaN(limit) || limit <= 0) {
    alert("Invalid limit ❌");
    return;
  }

  try {

    await setDoc(doc(db, "coupons", code), {
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
    console.error("CREATE ERROR:", err);
    alert("Error creating coupon ❌");
  }
});

// =======================================
// ENABLE / DISABLE COUPON (SAFE)
// =======================================
window.toggleCoupon = async function (code, currentState) {

  try {

    const newState = currentState === true || currentState === "true";

    await updateDoc(doc(db, "coupons", code), {
      active: !newState
    });

    loadCoupons();

  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    alert("Failed to update coupon ❌");
  }
};

// INIT
loadCoupons();
