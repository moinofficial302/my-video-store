// =======================================
// WITHDRAW PAGE LOGIC
// FILE: js/withdraw.js
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
// LOAD REFERRAL BALANCE
// =======================================
async function loadReferralBalance(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const balance = snap.data().referralBalance || 0;
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
  const balance = snap.data().referralBalance || 0;

  if (amount > balance) {
    alert("Insufficient referral balance");
    return;
  }

  // Deduct referral balance
  await updateDoc(userRef, {
    referralBalance: increment(-amount)
  });

  // Create withdraw request
  await addDoc(collection(db, "withdraw_requests"), {
    uid: user.uid,
    amount: amount,
    method: method,
    upi: upi,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Withdrawal request submitted");
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
}

// =======================================
// CONVERT TO WEBSITE COINS
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
  const balance = snap.data().referralBalance || 0;

  if (amount > balance) {
    alert("Insufficient referral balance");
    return;
  }

  // Update balances
  await updateDoc(userRef, {
    referralBalance: increment(-amount),
    coins: increment(amount)
  });

  // Save history
  await addDoc(collection(db, "referral_conversions"), {
    uid: user.uid,
    amount: amount,
    createdAt: serverTimestamp()
  });

  alert("Converted to website coins");
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
}

// =======================================
// LOAD HISTORY
// =======================================
async function loadHistory(uid) {
  const historyBox = document.querySelector(".card:last-child");
  historyBox.innerHTML = "<h2>History</h2>";

  // Withdraw history
  const wq = query(
    collection(db, "withdraw_requests"),
    where("uid", "==", uid)
  );
  const wSnap = await getDocs(wq);

  wSnap.forEach(d => {
    const data = d.data();
    historyBox.innerHTML += `
      <div class="history-item">
        <div>Withdraw ₹${data.amount}</div>
        <div class="status ${data.status}">
          ${data.status.toUpperCase()}
        </div>
      </div>
    `;
  });

  // Convert history
  const cq = query(
    collection(db, "referral_conversions"),
    where("uid", "==", uid)
  );
  const cSnap = await getDocs(cq);

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
