// =======================================
// 🚀 AKANS ADMIN WITHDRAWAL PANEL (FINAL)
// Jarvis Clean Version 💛
// =======================================

import { db } from "../../js/firebase-init.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ⭐ IMPORTANT (same as user side)
const COLLECTION = "withdraw_requests";

const tableBody = document.getElementById("withdrawTable");
const pendingEl = document.getElementById("pendingWithdrawals");


// =======================================
// LOAD PENDING REQUESTS
// =======================================
async function loadWithdrawals() {

  tableBody.innerHTML = "";

  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);

  let count = 0;

  snap.forEach(d => {

    count++;

    const data = d.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.email || "User"}</td>
      <td>₹${data.amount}</td>
      <td>${data.upi || "-"}</td>
      <td style="color:#facc15">Pending</td>
      <td>
        <button onclick="approveWithdraw('${d.id}')">Approve</button>
        <button onclick="rejectWithdraw('${d.id}')">Reject</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  if (pendingEl) pendingEl.innerText = count;
}


// =======================================
// APPROVE
// =======================================
window.approveWithdraw = async (id) => {

  await updateDoc(doc(db, COLLECTION, id), {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Approved ✅");
  loadWithdrawals();
};


// =======================================
// REJECT + REFUND
// =======================================
window.rejectWithdraw = async (id) => {

  const snap = await getDoc(doc(db, COLLECTION, id));
  const data = snap.data();

  // refund referral balance
  await updateDoc(doc(db, "users", data.uid), {
    referralBalance: increment(data.amount)
  });

  await updateDoc(doc(db, COLLECTION, id), {
    status: "rejected",
    rejectedAt: serverTimestamp()
  });

  alert("Rejected & refunded ✅");
  loadWithdrawals();
};


// =======================================
// INIT
// =======================================
loadWithdrawals();
