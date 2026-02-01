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
  serverTimestamp,
  addDoc,
  getDoc
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
    const reqSnap = await getDoc(reqRef);

    if (!reqSnap.exists()) {
      alert("Request not found");
      return;
    }

    const requestData = reqSnap.data();

    // 1️⃣ Add coins to user
    const userRef = doc(db, "users", requestData.uid);
    await updateDoc(userRef, {
      coins: increment(requestData.amount)
    });

    // 🔥 2️⃣ SUPER REFER REWARD (40%) — YAHI ADD KIYA HAI
    await handleSuperReferral(requestData.uid, requestData.amount);

await handleNormalReferral(requestData.uid, requestData.amount);

    
    // 3️⃣ Update request status
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
// SUPER REFER LOGIC (40%)
// =======================================
async function handleSuperReferral(userUid, amount) {
  const userRef = doc(db, "users", userUid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const user = userSnap.data();

  // ✅ CONDITIONS
  if (
    user.referredBy &&
    user.referralMode === "super" &&
    user.superRewardGiven === false
  ) {
    // Find referrer
    const q = query(
      collection(db, "users"),
      where("myReferralCode", "==", user.referredBy)
    );

    const refSnap = await getDocs(q);
    if (refSnap.empty) return;

    const refDoc = refSnap.docs[0];
    const referrerUid = refDoc.id;

    const rewardAmount = Math.floor(amount * 0.4);

    // Add referral reward
    await updateDoc(doc(db, "users", referrerUid), {
      referralBalance: increment(rewardAmount)
    });

    // Mark used
    await updateDoc(userRef, {
      superRewardGiven: true
    });

    // Save history
    await addDoc(collection(db, "referral_earnings"), {
      referrerUid: referrerUid,
      fromUserUid: userUid,
      amount: rewardAmount,
      percent: 40,
      type: "super",
      paymentNumber: 1,
      createdAt: serverTimestamp()
    });
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



// =======================================
// NORMAL REFER LOGIC (15% → 10% ONLY)
// =======================================
async function handleNormalReferral(userUid, amount) {
  const userRef = doc(db, "users", userUid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const user = userSnap.data();

  // ❌ Agar super refer laga hai → normal skip
  if (user.referralMode === "super") return;

  // ❌ Referral hi nahi hai
  if (!user.referredBy) return;

  // Count check
  let percent = 0;
  let paymentNumber = user.normalReferralCount + 1;

  if (paymentNumber === 1) percent = 15;
  else if (paymentNumber === 2) percent = 10;
  else return; // ❌ 3rd time kuch bhi nahi

  // Find referrer
  const q = query(
    collection(db, "users"),
    where("myReferralCode", "==", user.referredBy)
  );

  const refSnap = await getDocs(q);
  if (refSnap.empty) return;

  const refDoc = refSnap.docs[0];
  const referrerUid = refDoc.id;

  const rewardAmount = Math.floor(amount * (percent / 100));

  // Add referral reward
  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(rewardAmount)
  });

  // Update count
  await updateDoc(userRef, {
    normalReferralCount: increment(1)
  });

  // Save history
  await addDoc(collection(db, "referral_earnings"), {
    referrerUid: referrerUid,
    fromUserUid: userUid,
    amount: rewardAmount,
    percent: percent,
    type: "normal",
    paymentNumber: paymentNumber,
    createdAt: serverTimestamp()
  });
}
