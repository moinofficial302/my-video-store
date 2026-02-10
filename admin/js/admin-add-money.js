/* =====================================================
   🚀 ADMIN ADD MONEY SYSTEM – FINAL STABLE PRO
   Jarvis Production Build 💛
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


let tableBody;
let pendingAddMoneyEl;


/* =====================================================
   🟢 INIT AFTER DOM READY (IMPORTANT FIX)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  tableBody = document.getElementById("addMoneyTable");
  pendingAddMoneyEl = document.getElementById("pendingAddMoney");

  loadAddMoneyRequests();
});


/* =====================================================
   📥 LOAD REQUESTS
===================================================== */
async function loadAddMoneyRequests() {

  if (!tableBody) return;

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
          <button onclick="window.approveMoney('${d.id}')">Approve</button>
          <button onclick="window.rejectMoney('${d.id}')">Reject</button>
        </td>
      </tr>
    `;
  });

  if (pendingAddMoneyEl)
    pendingAddMoneyEl.textContent = count;
}


/* =====================================================
   ✅ APPROVE (GLOBAL FIX)
===================================================== */
window.approveMoney = async function (id) {

  try {

    const reqSnap = await getDoc(doc(db, "add_money_requests", id));
    if (!reqSnap.exists()) return;

    const req = reqSnap.data();

    const userRef = doc(db, "users", req.uid);

    /* add coins */
    await updateDoc(userRef, {
      coins: increment(req.amount),
      addMoneyTotal: increment(req.amount)
    });

    /* referral reward */
    await handleReferralReward(req.uid, req.amount);

    /* mark approved */
    await updateDoc(doc(db, "add_money_requests", id), {
      status: "approved",
      approvedAt: serverTimestamp()
    });

    alert("Approved ✅");

    loadAddMoneyRequests();

  } catch (e) {
    alert(e.message);
  }
};


/* =====================================================
   ❌ REJECT (GLOBAL FIX)
===================================================== */
window.rejectMoney = async function (id) {

  await updateDoc(doc(db, "add_money_requests", id), {
    status: "rejected"
  });

  alert("Rejected ❌");

  loadAddMoneyRequests();
};


/* =====================================================
   ⭐ REFERRAL ENGINE (SAFE)
===================================================== */
async function handleReferralReward(userUid, amount) {

  const userSnap = await getDoc(doc(db, "users", userUid));
  if (!userSnap.exists()) return;

  const user = userSnap.data();
  if (!user.referredBy) return;

  const q = query(
    collection(db, "users"),
    where("referralCode", "==", user.referredBy)
  );

  const refSnap = await getDocs(q);
  if (refSnap.empty) return;

  const refDoc = refSnap.docs[0];
  const referrerUid = refDoc.id;
  const referrer = refDoc.data();

  const paymentNumber = (user.refCount || 0) + 1;

  let percent = 0;

  const isPremium = (referrer.addMoneyTotal || 0) >= 99;

  if (paymentNumber === 1)
    percent = isPremium ? 40 : 15;
  else if (paymentNumber === 2)
    percent = isPremium ? 25 : 10;
  else
    return;

  const reward = Math.floor(amount * percent / 100);

  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(reward)
  });

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
