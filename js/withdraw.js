// =======================================
// WITHDRAW PAGE LOGIC (FINAL FIXED)
// =======================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================================
// AUTH CHECK
// =======================================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
});

// =======================================
// COMMON BALANCE GETTER (🔥 MAIN FIX)
// =======================================
function getReferralBalance(data) {
  return (
    data.referralBalance ??
    data.referralWallet ??
    data.referralCoins ??
    0
  );
}

// =======================================
// LOAD REFERRAL BALANCE
// =======================================
async function loadReferralBalance(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const balance = getReferralBalance(data);

  document.getElementById("referralBalance").innerText = "₹" + balance;
}

// =======================================
// WITHDRAW REQUEST
// =======================================
document.querySelector("#withdrawForm .submit-btn")
  .addEventListener("click", submitWithdraw);

async function submitWithdraw() {
  const user = auth.currentUser;
  if (!user) return;

  const amount = Number(document.getElementById("withdrawAmount").value);
  const method = document.getElementById("paymentMethod").value;
  const upi = document.getElementById("upiInput").value.trim();

  if (amount < 20) {
    alert("Minimum withdraw ₹20");
    return;
  }

  if (!upi) {
    alert("Enter UPI / Mobile Number");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.data();

  const balance = getReferralBalance(data);

  if (amount > balance) {
    alert("Insufficient referral balance");
    return;
  }

  // Deduct
  await updateDoc(userRef, {
    referralBalance: increment(-amount)
  });

  // Save request
  await addDoc(collection(db, "withdraw_requests"), {
    uid: user.uid,
    amount,
    method,
    upi,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Withdrawal request submitted");
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
}

// =======================================
// CONVERT TO COINS
// =======================================
document.querySelector("#convertForm .submit-btn")
  .addEventListener("click", convertCoins);

async function convertCoins() {
  const user = auth.currentUser;
  if (!user) return;

  const amount = Number(document.getElementById("convertAmount").value);

  if (amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.data();

  const balance = getReferralBalance(data);

  if (amount > balance) {
    alert("Insufficient referral balance");
    return;
  }

  await updateDoc(userRef, {
    referralBalance: increment(-amount),
    coins: increment(amount)
  });

  await addDoc(collection(db, "referral_conversions"), {
    uid: user.uid,
    amount,
    createdAt: serverTimestamp()
  });

  alert("Converted to website coins");
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
}

// =======================================
// LOAD HISTORY (🔥 CLEAN FIX)
// =======================================
async function loadHistory(uid) {
  const historyBox = document.querySelector(".card:last-child");
  historyBox.innerHTML = "<h2>History</h2>";

  // Withdraw
  const wSnap = await getDocs(query(
    collection(db, "withdraw_requests"),
    where("uid", "==", uid)
  ));

  wSnap.forEach(d => {
    const data = d.data();

    let statusText =
      data.status === "approved" ? "Withdrawal Successfully ✅" :
      data.status === "pending" ? "Pending ⏳" :
      "Rejected ❌";

    historyBox.innerHTML += `
      <div class="history-item">
        <div>Withdraw ₹${data.amount}</div>
        <div class="status ${data.status}">
          ${statusText}
        </div>
      </div>
    `;
  });

  // Convert
  const cSnap = await getDocs(query(
    collection(db, "referral_conversions"),
    where("uid", "==", uid)
  ));

  cSnap.forEach(d => {
    const data = d.data();

    historyBox.innerHTML += `
      <div class="history-item">
        <div>Converted ₹${data.amount} → Coins</div>
        <div class="status approved">COMPLETED</div>
      </div>
    `;
  });
}
