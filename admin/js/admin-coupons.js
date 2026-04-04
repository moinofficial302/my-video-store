
// =======================================
// ADMIN COUPON SYSTEM (FINAL PRO)
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
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
      <tr><td colspan="6">No Coupons Found</td></tr>
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
      <td>${limit - used}</td>
      <td>
        <button onclick="toggleCoupon('${docSnap.id}', ${active})">
          ${active ? "Disable" : "Enable"}
        </button>
        <button onclick="deleteCoupon('${docSnap.id}')">
          Delete
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

  const codeInput = prompt("Coupon Code (e.g. AKANS50)");
  if (!codeInput) return;

  const code = codeInput.trim().toUpperCase();

  // 🔒 DUPLICATE CHECK
  const existing = await getDoc(doc(db, "coupons", code));
  if (existing.exists()) {
    alert("Coupon already exists ❌");
    return;
  }

  // 🔒 COINS
  const coins = Number(prompt("Coins to Add"));
  if (isNaN(coins) || coins <= 0) {
    alert("Invalid coins ❌");
    return;
  }

  // 🔒 LIMIT
  const limit = Number(prompt("Usage Limit"));
  if (isNaN(limit) || limit <= 0) {
    alert("Invalid limit ❌");
    return;
  }

  try {

    await setDoc(doc(db, "coupons", code), {
      coins: coins,
      value: coins, // future safe
      limit: limit,
      used: 0,
      active: true,
      createdAt: serverTimestamp()
    });

    alert("Coupon Created ✅");
    loadCoupons();

  } catch (err) {
    console.error("CREATE ERROR:", err);
    alert("Error creating coupon ❌");
  }
});

// =======================================
// ENABLE / DISABLE
// =======================================
window.toggleCoupon = async function (code, currentState) {

  try {

    await updateDoc(doc(db, "coupons", code), {
      active: !currentState
    });

    loadCoupons();

  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    alert("Failed ❌");
  }
};

// =======================================
// DELETE COUPON
// =======================================
window.deleteCoupon = async function (code) {

  const confirmDelete = confirm(`Delete coupon ${code}?`);

  if (!confirmDelete) return;

  try {

    await deleteDoc(doc(db, "coupons", code));

    alert("Deleted ✅");
    loadCoupons();

  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert("Delete failed ❌");
  }
};

// INIT
loadCoupons();
