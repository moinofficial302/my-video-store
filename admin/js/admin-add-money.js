/* =====================================================
   🚀 ADMIN ADD MONEY – FINAL REFERRAL ENGINE
   Clean • Fast • New System Only
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
  getDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



/* =====================================================
   DOM
===================================================== */

const tableBody = document.getElementById("addMoneyTable");
const pendingAddMoneyEl = document.getElementById("pendingAddMoney");



/* =====================================================
   LOAD PENDING
===================================================== */

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
        <button class="approve" data-id="${d.id}">Approve</button>
        <button class="reject" data-id="${d.id}">Reject</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  if (pendingAddMoneyEl) pendingAddMoneyEl.textContent = count;

  bindActions();
}



/* =====================================================
   BUTTON BIND
===================================================== */

function bindActions() {

  document.querySelectorAll(".approve").forEach(btn =>
    btn.onclick = () => approveRequest(btn.dataset.id)
  );

  document.querySelectorAll(".reject").forEach(btn =>
    btn.onclick = () => rejectRequest(btn.dataset.id)
  );
}



/* =====================================================
   APPROVE PAYMENT
===================================================== */

async function approveRequest(id) {

  if (!confirm("Approve this payment?")) return;

  const reqRef = doc(db, "add_money_requests", id);
  const reqSnap = await getDoc(reqRef);

  if (!reqSnap.exists()) return;

  const data = reqSnap.data();

  const userRef = doc(db, "users", data.uid);

  /* ===============================
     1️⃣ ADD COINS
  =============================== */

  await updateDoc(userRef, {
    coins: increment(data.amount)
  });

  /* ===============================
     2️⃣ HANDLE REFERRAL REWARD
  =============================== */

  await processReferralReward(data.uid, data.amount);

  /* ===============================
     3️⃣ UPDATE STATUS
  =============================== */

  await updateDoc(reqRef, {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Approved ✅");

  loadAddMoneyRequests();
}



/* =====================================================
   🚀 NEW REFERRAL ENGINE
===================================================== */

async function processReferralReward(userUid, amount) {

  const userSnap = await getDoc(doc(db, "users", userUid));
  if (!userSnap.exists()) return;

  const user = userSnap.data();

  /* ❌ no referral */
  if (!user.referredBy) return;

  /* find referrer */
  const q = query(
    collection(db, "users"),
    where(
      user.referredType === "super" ? "superCode" : "normalCode",
      "==",
      user.referredBy
    )
  );

  const refSnap = await getDocs(q);
  if (refSnap.empty) return;

  const refDoc = refSnap.docs[0];
  const refId = refDoc.id;
  const refData = refDoc.data();

  let count = refData.refCount || 0;

  let percent = 0;

  /* ===============================
     NORMAL
  =============================== */
  if (user.referredType === "normal") {
    if (count === 0) percent = 15;
    else if (count === 1) percent = 10;
    else return;
  }

  /* ===============================
     SUPER
  =============================== */
  if (user.referredType === "super") {
    if (count === 0) percent = 40;
    else if (count === 1) percent = 25;
    else return;
  }

  const reward = Math.floor(amount * percent / 100);

  /* add reward */
  await updateDoc(doc(db, "users", refId), {
    referralBalance: increment(reward),
    refCount: increment(1)
  });

  /* history */
  await addDoc(collection(db, "referral_earnings"), {
    referrerUid: refId,
    fromUserUid: userUid,
    amount: reward,
    percent,
    type: user.referredType,
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
    rejectedReason: reason,
    rejectedAt: serverTimestamp()
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
