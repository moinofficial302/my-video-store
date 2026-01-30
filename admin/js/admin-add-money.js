// =======================================
// ADMIN ADD MONEY REQUESTS
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
const tableBody = document.getElementById("addMoneyTable");
const pendingAddMoneyEl = document.getElementById("pendingAddMoney");

// =======================================
// LOAD PENDING REQUESTS
// =======================================
async function loadAddMoneyRequests() {
  try {
    const ref = collection(db, "add_money_requests");
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
        <td>${data.utr}</td>
        <td>${data.paymentApp}</td>
        <td>${formatDate(data.createdAt)}</td>
        <td>
          <button class="approve-btn" data-id="${docSnap.id}">Approve</button>
          <button class="reject-btn" data-id="${docSnap.id}">Reject</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (pendingAddMoneyEl) {
      pendingAddMoneyEl.textContent = pendingCount;
    }

    bindActions();

  } catch (err) {
    console.error("Add money load error:", err);
  }
}

// =======================================
// BUTTON ACTIONS
// =======================================
function bindActions() {
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => approveRequest(btn.dataset.id));
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => rejectRequest(btn.dataset.id));
  });
}

// =======================================
// APPROVE REQUEST
// =======================================
async function approveRequest(requestId) {
  const confirmApprove = confirm("Approve this payment?");
  if (!confirmApprove) return;

  try {
    const reqRef = doc(db, "add_money_requests", requestId);
    const reqSnap = await getDocs(query(
      collection(db, "add_money_requests"),
      where("__name__", "==", requestId)
    ));

    let requestData;
    reqSnap.forEach(d => requestData = d.data());

    if (!requestData) return alert("Request not found");

    // 1️⃣ Add coins to user
    const userRef = doc(db, "users", requestData.uid);
    await updateDoc(userRef, {
      coins: increment(requestData.amount)
    });

    // 2️⃣ Update request status
    await updateDoc(reqRef, {
      status: "approved",
      approvedAt: serverTimestamp()
    });

    alert("Payment approved & coins added");
    loadAddMoneyRequests();

  } catch (error) {
    console.error("Approve error:", error);
    alert("Error approving request");
  }
}

// =======================================
// REJECT REQUEST
// =======================================
async function rejectRequest(requestId) {
  const reason = prompt("Enter rejection reason");
  if (!reason) return;

  try {
    const ref = doc(db, "add_money_requests", requestId);
    await updateDoc(ref, {
      status: "rejected",
      rejectedReason: reason,
      rejectedAt: serverTimestamp()
    });

    alert("Request rejected");
    loadAddMoneyRequests();

  } catch (error) {
    console.error("Reject error:", error);
    alert("Error rejecting request");
  }
}

// =======================================
// DATE FORMAT
// =======================================
function formatDate(ts) {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// =======================================
// INIT
// =======================================
loadAddMoneyRequests();
