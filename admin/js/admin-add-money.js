/* =====================================================
   ADMIN ADD MONEY SYSTEM
   Added: Gmail column + Submit time column
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

document.addEventListener("DOMContentLoaded", () => {
  tableBody         = document.getElementById("addMoneyTable");
  pendingAddMoneyEl = document.getElementById("pendingAddMoney");
  loadAddMoneyRequests();
});

function formatDateTime(ts) {
  if (!ts) return "—";
  try {
    const d    = ts.toDate();
    const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `<div style="font-weight:600;font-size:13px;">${date}</div><div style="font-size:11px;color:#64748b;">${time}</div>`;
  } catch { return "—"; }
}

async function loadAddMoneyRequests() {
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">Loading...</td></tr>`;

  const q    = query(collection(db, "add_money_requests"), where("status", "==", "pending"));
  const snap = await getDocs(q);

  tableBody.innerHTML = "";
  let count = 0;

  if (snap.empty) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">No pending requests</td></tr>`;
    if (pendingAddMoneyEl) pendingAddMoneyEl.textContent = 0;
    return;
  }

  snap.forEach(d => {
    count++;
    const data = d.data();
    const tr   = document.createElement("tr");
    tr.innerHTML = `
      <td><div style="font-weight:700;color:#0f172a;">${data.name || "User"}</div></td>
      <td style="color:#374151;font-size:13px;">${data.email || data.gmail || "—"}</td>
      <td style="font-weight:600;">₹${data.amount}</td>
      <td style="font-family:monospace;font-size:13px;">${data.utr}</td>
      <td>${data.paymentApp || "—"}</td>
      <td>${formatDateTime(data.createdAt || data.submittedAt)}</td>
      <td>
        <button class="btn btn-success" style="font-size:12px;padding:5px 12px;margin-right:6px;"
          onclick="window.approveMoney('${d.id}', this)">✅ Approve</button>
        <button class="btn btn-danger" style="font-size:12px;padding:5px 12px;"
          onclick="window.rejectMoney('${d.id}', this)">❌ Reject</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (pendingAddMoneyEl) pendingAddMoneyEl.textContent = count;
}

window.approveMoney = async function (id, btn) {
  if (btn) btn.disabled = true;
  try {
    await runTransaction(db, async (transaction) => {
      const reqRef  = doc(db, "add_money_requests", id);
      const reqSnap = await transaction.get(reqRef);
      if (!reqSnap.exists()) throw new Error("Request not found");
      const req = reqSnap.data();
      if (req.status !== "pending") throw new Error("Already processed");
      const userRef  = doc(db, "users", req.uid);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      transaction.update(userRef,  { coins: increment(req.amount), addMoneyTotal: increment(req.amount) });
      transaction.update(reqRef,   { status: "approved", approvedAt: serverTimestamp() });
    });
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

window.rejectMoney = async function (id, btn) {
  if (btn) btn.disabled = true;
  try {
    await updateDoc(doc(db, "add_money_requests", id), { status: "rejected" });
    alert("Rejected ❌");
    loadAddMoneyRequests();
  } catch (e) {
    alert(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
};

async function handleReferralRewardSafe(requestId) {
  const reqSnap = await getDoc(doc(db, "add_money_requests", requestId));
  if (!reqSnap.exists()) return;
  const req = reqSnap.data();
  const userSnap = await getDoc(doc(db, "users", req.uid));
  if (!userSnap.exists()) return;
  const user = userSnap.data();
  if (req.referralGiven) return;
  if (!user.referredBy)  return;
  const q       = query(collection(db, "users"), where("referralCode", "==", user.referredBy));
  const refSnap = await getDocs(q);
  if (refSnap.empty) return;
  const refDoc      = refSnap.docs[0];
  const referrerUid = refDoc.id;
  const referrer    = refDoc.data();
  const paymentNumber = (user.refCount || 0) + 1;
  let percent = 0;
  const isPremium = (referrer.addMoneyTotal || 0) >= 99;
  if (paymentNumber === 1)      percent = isPremium ? 40 : 15;
  else if (paymentNumber === 2) percent = isPremium ? 25 : 10;
  else return;
  const reward = Math.floor(req.amount * percent / 100);
  await updateDoc(doc(db, "users", referrerUid), { referralBalance: increment(reward) });
  await updateDoc(doc(db, "users", req.uid),     { refCount: increment(1) });
  await updateDoc(doc(db, "add_money_requests", requestId), { referralGiven: true });
  await addDoc(collection(db, "referral_earnings"), {
    referrerUid, fromUserUid: req.uid, amount: reward, percent, createdAt: serverTimestamp()
  });
}
