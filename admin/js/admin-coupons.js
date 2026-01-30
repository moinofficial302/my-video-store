// =======================================
// ADMIN COUPONS SYSTEM
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  addDoc,
  getDocs,
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

  snapshot.forEach(docSnap => {
    const d = docSnap.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.code}</td>
      <td>${d.value}</td>
      <td>${d.limit}</td>
      <td>${d.used || 0}</td>
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

  const value = Number(prompt("Coins Value"));
  if (!value) return alert("Invalid value");

  const limit = Number(prompt("Usage Limit"));
  if (!limit) return alert("Invalid limit");

  try {
    await addDoc(collection(db, "coupons"), {
      code: code.toUpperCase(),
      value,
      limit,
      used: 0,
      active: true,
      createdAt: serverTimestamp()
    });

    alert("Coupon Created Successfully");
    loadCoupons();

  } catch (err) {
    console.error(err);
    alert("Error creating coupon");
  }
});

// INIT
loadCoupons();
