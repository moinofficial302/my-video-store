/* =====================================================
   🚀 ADMIN ADD MONEY SYSTEM (SMART REFERRAL ENGINE)
   Single Link • Dynamic Reward • Production Safe
===================================================== */

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



/* =====================================================
   DOM
===================================================== */

const tableBody = document.getElementById("addMoneyTable");
const pendingAddMoneyEl = document.getElementById("pendingAddMoney");



/* =====================================================
   LOAD REQUESTS
===================================================== */

async function loadAddMoneyRequests() {

  const ref = collection(db, "add_money_requests");
  const q = query(ref, where("status", "==", "pending"));

  const snapshot = await getDocs(q);

  tableBody.innerHTML = "";
  let count = 0;

  snapshot.forEach(docSnap => {

    count++;

    const d = docSnap.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.name || "User"}</td>
      <td>₹${d.amount}</td>
      <td>${d.utr}</td>
      <td>${d.paymentApp}</td>
      <td>${formatDate(d.createdAt)}</td>
      <td>
        <button class="approve-btn" data-id="${docSnap.id}">Approve</button>
        <button class="reject-btn" data-id="${docSnap.id}">Reject</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  pendingAddMoneyEl.textContent = count;

  bindActions();
}



/* =====================================================
   BUTTON EVENTS
===================================================== */

function bindActions() {

  document.querySelectorAll(".approve-btn")
    .forEach(btn =>
      btn.onclick = () => approveRequest(btn.dataset.id)
    );

  document.querySelectorAll(".reject-btn")
    .forEach(btn =>
      btn.onclick = () => rejectRequest(btn.dataset.id)
    );
}



/* =====================================================
   APPROVE PAYMENT
===================================================== */

async function approveRequest(requestId) {

  if (!confirm("Approve this payment?")) return;

  const reqRef = doc(db, "add_money_requests", requestId);
  const reqSnap = await getDoc(reqRef);

  if (!reqSnap.exists()) return;

  const request = reqSnap.data();

  const userRef = doc(db, "users", request.uid);



  /* =====================================================
     1️⃣ ADD COINS + COINS SPENT
  ===================================================== */

  await updateDoc(userRef, {
    coins: increment(request.amount),
    coinsSpent: increment(request.amount)
  });



  /* =====================================================
     2️⃣ SMART REFERRAL REWARD
  ===================================================== */

  await handleReferralReward(request.uid, request.amount);



  /* =====================================================
     3️⃣ MARK APPROVED
  ===================================================== */

  await updateDoc(reqRef, {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Payment approved ✅");

  loadAddMoneyRequests();
}



/* =====================================================
   🔥 SMART REFERRAL LOGIC
===================================================== */

async function handleReferralReward(userUid, amount) {

  const userRef = doc(db, "users", userUid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const user = userSnap.data();

  /* ❌ no referrer */
  if (!user.referredBy) return;



  /* =====================================================
     FIND REFERRER BY CODE
  ===================================================== */

  const q = query(
    collection(db, "users"),
    where("referralCode", "==", user.referredBy)
  );

  const refSnap = await getDocs(q);

  if (refSnap.empty) return;

  const refDoc = refSnap.docs[0];
  const referrerUid = refDoc.id;
  const referrer = refDoc.data();



  /* =====================================================
     CALCULATE %
  ===================================================== */

  const paymentNumber = (user.refCount || 0) + 1;

  let percent = 0;

  const isPremium = (referrer.coinsSpent || 0) >= 99;

  if (paymentNumber === 1)
    percent = isPremium ? 40 : 15;

  else if (paymentNumber === 2)
    percent = isPremium ? 25 : 10;

  else
    return; // only 2 times



  const reward = Math.floor(amount * percent / 100);



  /* =====================================================
     GIVE REWARD
  ===================================================== */

  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(reward)
  });



  /* =====================================================
     UPDATE USER COUNT
  ===================================================== */

  await updateDoc(userRef, {
    refCount: increment(1)
  });



  /* =====================================================
     SAVE HISTORY
  ===================================================== */

  await addDoc(collection(db, "referral_earnings"), {
    referrerUid,
    fromUserUid: userUid,
    amount: reward,
    percent,
    createdAt: serverTimestamp()
  });
}



/* =====================================================
   REJECT
===================================================== */

async function rejectRequest(id) {

  const reason = prompt("Reason?");
  if (!reason) return;

  await updateDoc(doc(db, "add_money_requests", id), {
    status: "rejected",
    rejectedReason: reason
  });

  loadAddMoneyRequests();
}



/* =====================================================
   DATE
===================================================== */

function formatDate(ts) {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("en-IN");
}



/* =====================================================
   INIT
===================================================== */

loadAddMoneyRequests();
