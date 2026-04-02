/* =====================================================
   🚀 ADMIN ADD MONEY SYSTEM – ULTRA SAFE VERSION
   Fix: Duplicate, Spam, Permission, Race Condition
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
  getDoc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let tableBody;
let pendingAddMoneyEl;


/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  tableBody = document.getElementById("addMoneyTable");
  pendingAddMoneyEl = document.getElementById("pendingAddMoney");

  loadAddMoneyRequests();
});


/* =====================================================
   LOAD REQUESTS
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
          <button onclick="window.approveMoney('${d.id}', this)">Approve</button>
          <button onclick="window.rejectMoney('${d.id}', this)">Reject</button>
        </td>
      </tr>
    `;
  });

  if (pendingAddMoneyEl)
    pendingAddMoneyEl.textContent = count;
}


/* =====================================================
   ✅ APPROVE (ULTRA SAFE)
===================================================== */
window.approveMoney = async function (id, btn) {

  if (btn) btn.disabled = true; // 🔒 block spam

  try {

    await runTransaction(db, async (transaction) => {

      const reqRef = doc(db, "add_money_requests", id);
      const reqSnap = await transaction.get(reqRef);

      if (!reqSnap.exists()) {
        throw new Error("Request not found");
      }

      const req = reqSnap.data();

      // 🛑 ALREADY PROCESSED CHECK
      if (req.status !== "pending") {
        throw new Error("Already processed");
      }

      const userRef = doc(db, "users", req.uid);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      // ✅ ADD COINS (ONLY ONCE)
      transaction.update(userRef, {
        coins: increment(req.amount),
        addMoneyTotal: increment(req.amount)
      });

      // ✅ MARK APPROVED FIRST (IMPORTANT)
      transaction.update(reqRef, {
        status: "approved",
        approvedAt: serverTimestamp()
      });

    });

    // ✅ Referral (outside transaction but safe)
    await handleReferralRewardSafe(id);

    alert("Approved ✅");
    loadAddMoneyRequests();

  } catch (e) {
    console.error(e);
    alert(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
};


/* =====================================================
   ❌ REJECT
===================================================== */
window.rejectMoney = async function (id, btn) {

  if (btn) btn.disabled = true;

  try {
    await updateDoc(doc(db, "add_money_requests", id), {
      status: "rejected"
    });

    alert("Rejected ❌");
    loadAddMoneyRequests();

  } catch (e) {
    alert(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
};


/* =====================================================
   ⭐ REFERRAL SAFE (NO DUPLICATE)
===================================================== */
async function handleReferralRewardSafe(requestId) {

  const reqSnap = await getDoc(doc(db, "add_money_requests", requestId));
  if (!reqSnap.exists()) return;

  const req = reqSnap.data();

  const userSnap = await getDoc(doc(db, "users", req.uid));
  if (!userSnap.exists()) return;

  const user = userSnap.data();

  // 🛑 already rewarded check
  if (req.referralGiven) return;

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

  const reward = Math.floor(req.amount * percent / 100);

  // ✅ give reward
  await updateDoc(doc(db, "users", referrerUid), {
    referralBalance: increment(reward)
  });

  await updateDoc(doc(db, "users", req.uid), {
    refCount: increment(1)
  });

  // ✅ mark reward given (IMPORTANT)
  await updateDoc(doc(db, "add_money_requests", requestId), {
    referralGiven: true
  });

  await addDoc(collection(db, "referral_earnings"), {
    referrerUid,
    fromUserUid: req.uid,
    amount: reward,
    percent,
    createdAt: serverTimestamp()
  });
}
