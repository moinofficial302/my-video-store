// =======================================
// ADMIN WITHDRAWAL REQUESTS
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM
const tableBody = document.getElementById("withdrawTable");
const pendingWithdrawalsEl = document.getElementById("pendingWithdrawals");

// =======================================
// LOAD WITHDRAWAL REQUESTS
// =======================================
async function loadWithdrawals() {
  try {
    const ref = collection(db, "withdrawal_requests");
    const q = query(ref, where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    tableBody.innerHTML = "";
    let pendingCount = 0;

    snapshot.forEach(docSnap => {
      pendingCount++;
      const data = docSnap.data();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.name || "User"}</td>
        <td>₹${data.amount}</td>
        <td>${data.paymentNumber}</td>
        <td><span style="color:#facc15">Pending</span></td>
        <td>
          <button class="btn btn-success approve-btn" data-id="${docSnap.id}">Approve</button>
          <button class="btn btn-danger reject-btn" data-id="${docSnap.id}">Reject</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (pendingWithdrawalsEl) {
      pendingWithdrawalsEl.textContent = pendingCount;
    }

    bindActions();

  } catch (err) {
    console.error("Withdrawal load error:", err);
  }
}

// =======================================
// BUTTON ACTIONS
// =======================================
function bindActions() {
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => approveWithdrawal(btn.dataset.id));
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => rejectWithdrawal(btn.dataset.id));
  });
}

// =======================================
// APPROVE WITHDRAWAL
// =======================================
async function approveWithdrawal(requestId) {
  const ok = confirm("Payment sent? Approve withdrawal?");
  if (!ok) return;

  try {
    const ref = doc(db, "withdrawal_requests", requestId);

    await updateDoc(ref, {
      status: "approved",
      approvedAt: serverTimestamp()
    });

    alert("Withdrawal approved");
    loadWithdrawals();

  } catch (err) {
    console.error(err);
    alert("Approve failed");
  }
}

// =======================================
// REJECT WITHDRAWAL (REFUND COINS)
// =======================================
async function rejectWithdrawal(requestId) {
  const reason = prompt("Rejection reason?");
  if (!reason) return;

  try {
    // get request
    const snap = await getDocs(
      query(collection(db, "withdrawal_requests"),
      where("__name__", "==", requestId))
    );

    let data;
    snap.forEach(d => data = d.data());
    if (!data) return alert("Request not found");

    // refund coins
    const userRef = doc(db, "users", data.uid);
    await updateDoc(userRef, {
      coins: increment(data.amount)
    });

    // update request
    await updateDoc(doc(db, "withdrawal_requests", requestId), {
      status: "rejected",
      rejectedReason: reason,
      rejectedAt: serverTimestamp()
    });

    alert("Withdrawal rejected & coins refunded");
    loadWithdrawals();

  } catch (err) {
    console.error(err);
    alert("Reject failed");
  }
}

// =======================================
// INIT
// =======================================
loadWithdrawals();
