/* =====================================================
   🚀 ADMIN ADD MONEY SYSTEM – FINAL PERFECT
   Smart Referral • Single Link • Unlimited Referrals
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


const tableBody = document.getElementById("addMoneyTable");
const pendingAddMoneyEl = document.getElementById("pendingAddMoney");


/* ================= LOAD ================= */
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

    tableBody.innerHTML += `
      <tr>
        <td>${data.name || "User"}</td>
        <td>₹${data.amount}</td>
        <td>${data.utr}</td>
        <td>${data.paymentApp}</td>
        <td>
          <button onclick="approve('${d.id}')">Approve</button>
          <button onclick="reject('${d.id}')">Reject</button>
        </td>
      </tr>
    `;
  });

  pendingAddMoneyEl.textContent = count;
}


/* ================= APPROVE ================= */
window.approve = async function(id) {

  const reqSnap = await getDoc(doc(db, "add_money_requests", id));
  if (!reqSnap.exists()) return;

  const req = reqSnap.data();

  const userRef = doc(db, "users", req.uid);

  /* add coins */
  await updateDoc(userRef, {
    coins: increment(req.amount),
    coinsSpent: increment(req.amount)
  });

  /* referral reward */
  await handleReferralReward(req.uid, req.amount);

  await updateDoc(doc(db, "add_money_requests", id), {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Approved ✅");
  loadAddMoneyRequests();
};


/* ================= ⭐ FINAL REFERRAL ENGINE ================= */
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

  /* ✅ CORRECT COUNT (PER USER) */
  const paymentNumber = (user.refCount || 0) + 1;

  let percent = 0;
  const isPremium = (referrer.coinsSpent || 0) >= 99;

  if (paymentNumber === 1)
    percent = isPremium ? 40 : 15;
  else if (paymentNumber === 2)
    percent = isPremium ? 25 : 10;
  else
    return;

  const reward = Math.floor(amount * percent / 100);

  /* give reward */
  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(reward)
  });

  /* increment USER count (NOT referrer) */
  await updateDoc(doc(db, "users", userUid), {
    refCount: increment(1)
  });

  await addDoc(collection(db, "referral_earnings"), {
    referrerUid,
    fromUserUid: userUid,
    amount: reward,
    percent,
    createdAt: serverTimestamp()
  });
}


/* ================= REJECT ================= */
window.reject = async function(id) {

  await updateDoc(doc(db, "add_money_requests", id), {
    status: "rejected"
  });

  loadAddMoneyRequests();
};


loadAddMoneyRequests();
