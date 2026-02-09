/* =====================================================
   🚀 ADMIN ADD MONEY SYSTEM (FINAL • BUG FREE)
   Smart Referral • Single Link • Production Safe
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


/* =========================
   DOM
========================= */
const tableBody = document.getElementById("addMoneyTable");
const pendingAddMoneyEl = document.getElementById("pendingAddMoney");


/* =========================
   LOAD REQUESTS
========================= */
async function loadAddMoneyRequests() {

  const q = query(
    collection(db, "add_money_requests"),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);

  tableBody.innerHTML = "";
  let count = 0;

  snap.forEach(d => {

    count++;
    const data = d.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.name || "User"}</td>
      <td>₹${data.amount}</td>
      <td>${data.utr}</td>
      <td>${data.paymentApp}</td>
      <td>${formatDate(data.createdAt)}</td>
      <td>
        <button class="approve-btn" data-id="${d.id}">Approve</button>
        <button class="reject-btn" data-id="${d.id}">Reject</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  pendingAddMoneyEl.textContent = count;

  bindActions();
}


/* =========================
   BUTTONS
========================= */
function bindActions() {

  document.querySelectorAll(".approve-btn")
    .forEach(b => b.onclick = () => approveRequest(b.dataset.id));

  document.querySelectorAll(".reject-btn")
    .forEach(b => b.onclick = () => rejectRequest(b.dataset.id));
}


/* =========================
   APPROVE
========================= */
async function approveRequest(id) {

  if (!confirm("Approve payment?")) return;

  const reqRef = doc(db, "add_money_requests", id);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) return;

  const req = reqSnap.data();

  const userRef = doc(db, "users", req.uid);

  /* 1️⃣ Add coins */
  await updateDoc(userRef, {
    coins: increment(req.amount),
    coinsSpent: increment(req.amount)
  });

  /* 2️⃣ Referral reward */
  await handleReferralReward(req.uid, req.amount);

  /* 3️⃣ Mark approved */
  await updateDoc(reqRef, {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Approved ✅");
  loadAddMoneyRequests();
}


/* =========================
   ⭐ FINAL REFERRAL ENGINE
========================= */
async function handleReferralReward(userUid, amount) {

  const userSnap = await getDoc(doc(db, "users", userUid));
  if (!userSnap.exists()) return;

  const user = userSnap.data();
  if (!user.referredBy) return;

  /* find referrer */
  const q = query(
    collection(db, "users"),
    where("referralCode", "==", user.referredBy)
  );

  const refSnap = await getDocs(q);
  if (refSnap.empty) return;

  const refDoc = refSnap.docs[0];
  const referrerUid = refDoc.id;
  const referrer = refDoc.data();

  /* ⭐ FIX: referrer count (NOT user) */
  const paymentNumber = (referrer.refCount || 0) + 1;

  let percent = 0;
  const isPremium = (referrer.coinsSpent || 0) >= 99;

  if (paymentNumber === 1) percent = isPremium ? 40 : 15;
  else if (paymentNumber === 2) percent = isPremium ? 25 : 10;
  else return;

  const reward = Math.floor(amount * percent / 100);

  /* give reward + update count */
  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(reward),
    refCount: increment(1)
  });

  /* history */
  await addDoc(collection(db, "referral_earnings"), {
    referrerUid,
    fromUserUid: userUid,
    amount: reward,
    percent,
    createdAt: serverTimestamp()
  });
}


/* =========================
   REJECT
========================= */
async function rejectRequest(id) {

  const reason = prompt("Reason?");
  if (!reason) return;

  await updateDoc(doc(db, "add_money_requests", id), {
    status: "rejected",
    rejectedReason: reason
  });

  loadAddMoneyRequests();
}


/* =========================
   DATE
========================= */
function formatDate(ts) {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("en-IN");
}


/* =========================
   INIT
========================= */
loadAddMoneyRequests();
