// =======================================
// WITHDRAW PAGE — UPGRADED (ALL BUGS FIXED)
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
  orderBy,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   🔔 TOAST (alert replace)
========================= */
function showToast(msg, type = "info", duration = 3200) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 400);
  }, duration);
}

/* =========================
   ⚙️ LOADING STATE HELPER
========================= */
function setLoading(btnId, spinnerId, textId, loading, defaultText) {
  const btn     = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  const text    = document.getElementById(textId);
  btn.disabled            = loading;
  spinner.classList.toggle("hidden", !loading);
  text.textContent        = loading ? "Please wait..." : defaultText;
}

/* =========================
   💰 BALANCE GETTER
   BUG FIX: handles 3 possible field names
========================= */
function getReferralBalance(data) {
  return Number(
    data.referralBalance ??
    data.referralWallet  ??
    data.referralCoins   ??
    0
  );
}

/* =========================
   🔑 BALANCE FIELD NAME GETTER
   BUG FIX: deduct from correct field
========================= */
function getReferralFieldName(data) {
  if (data.referralBalance !== undefined) return "referralBalance";
  if (data.referralWallet  !== undefined) return "referralWallet";
  if (data.referralCoins   !== undefined) return "referralCoins";
  return "referralBalance"; // default
}

/* =========================
   📊 LOAD BALANCE
========================= */
let currentBalance = 0;

async function loadReferralBalance(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;

    const data = snap.data();
    currentBalance = getReferralBalance(data);

    document.getElementById("referralBalance").textContent = "₹" + currentBalance;

    // Progress bar — max assumed ₹500 for visual
    const pct = Math.min((currentBalance / 500) * 100, 100);
    document.getElementById("balanceBar").style.width = pct + "%";
    document.getElementById("balanceBarLabel").textContent =
      currentBalance > 0
        ? `₹${currentBalance} available to withdraw or convert`
        : "No balance yet";

  } catch (err) {
    console.error("Balance load error:", err);
    showToast("Could not load balance ❌", "error");
  }
}

/* =========================
   🔒 AUTH CHECK
========================= */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadReferralBalance(user.uid);
  loadHistory(user.uid);
});

/* =========================
   💸 WITHDRAW SUBMIT
   BUG FIX: deducts correct field
========================= */
document.getElementById("withdrawSubmitBtn")
  .addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  const amount = Number(document.getElementById("withdrawAmount").value);
  const method = document.getElementById("paymentMethod").value;
  const upi    = document.getElementById("upiInput").value.trim();

  // Validations
  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount 💰", "warn"); return;
  }
  if (amount < 20) {
    showToast("Minimum withdrawal is ₹20 ⚡", "warn"); return;
  }
  if (!upi) {
    showToast("Please enter your UPI ID or mobile number 📱", "warn"); return;
  }
  if (!/^[\w.\-+]+@[\w]+$|^\d{10}$/.test(upi)) {
    showToast("Please enter a valid UPI ID (e.g. name@upi) or 10-digit mobile", "warn"); return;
  }

  setLoading("withdrawSubmitBtn", "wBtnSpinner", "wBtnText", true, "Submit Request");

  try {
    const userRef = doc(db, "users", user.uid);
    const snap    = await getDoc(userRef);
    const data    = snap.data();
    const balance = getReferralBalance(data);

    if (amount > balance) {
      showToast(`Insufficient balance! Available: ₹${balance} ❌`, "error");
      setLoading("withdrawSubmitBtn", "wBtnSpinner", "wBtnText", false, "Submit Request");
      return;
    }

    // BUG FIX: deduct from correct field name
    const fieldName = getReferralFieldName(data);
    await updateDoc(userRef, { [fieldName]: increment(-amount) });

    // Save request
    await addDoc(collection(db, "withdraw_requests"), {
      uid:       user.uid,
      amount:    amount,
      method:    method,
      upi:       upi,
      status:    "pending",
      createdAt: serverTimestamp()
    });

    showToast(`Withdrawal request of ₹${amount} submitted! ✅`, "success");

    // Reset form
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("upiInput").value       = "";
    document.getElementById("withdrawPreview").style.display = "none";

    await loadReferralBalance(user.uid);
    await loadHistory(user.uid);

  } catch (err) {
    console.error("Withdraw error:", err);
    showToast("Something went wrong. Please try again ❌", "error");
  } finally {
    setLoading("withdrawSubmitBtn", "wBtnSpinner", "wBtnText", false, "Submit Request");
  }
});

/* =========================
   🪙 CONVERT TO COINS
   BUG FIX: deducts correct field
========================= */
document.getElementById("convertSubmitBtn")
  .addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  const amount = Number(document.getElementById("convertAmount").value);

  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount 💰", "warn"); return;
  }

  setLoading("convertSubmitBtn", "cBtnSpinner", "cBtnText", true, "Convert Now");

  try {
    const userRef = doc(db, "users", user.uid);
    const snap    = await getDoc(userRef);
    const data    = snap.data();
    const balance = getReferralBalance(data);

    if (amount > balance) {
      showToast(`Insufficient balance! Available: ₹${balance} ❌`, "error");
      setLoading("convertSubmitBtn", "cBtnSpinner", "cBtnText", false, "Convert Now");
      return;
    }

    // BUG FIX: deduct correct field
    const fieldName = getReferralFieldName(data);
    await updateDoc(userRef, {
      [fieldName]: increment(-amount),
      coins:       increment(amount)
    });

    await addDoc(collection(db, "referral_conversions"), {
      uid:       user.uid,
      amount:    amount,
      createdAt: serverTimestamp()
    });

    showToast(`₹${amount} converted to ${amount} coins! 🪙`, "success");

    // Reset
    document.getElementById("convertAmount").value = "";
    document.getElementById("convertPreview").style.display = "none";

    await loadReferralBalance(user.uid);
    await loadHistory(user.uid);

  } catch (err) {
    console.error("Convert error:", err);
    showToast("Something went wrong. Please try again ❌", "error");
  } finally {
    setLoading("convertSubmitBtn", "cBtnSpinner", "cBtnText", false, "Convert Now");
  }
});

/* =========================
   📋 LOAD HISTORY
   BUG FIX: uses getElementById (not .card:last-child)
   NEW: date shown, sorted by date, combined list
========================= */
async function loadHistory(uid) {
  const historyList = document.getElementById("historyList");
  const historyCount = document.getElementById("historyCount");

  historyList.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  try {
    const allItems = [];

    // Withdraw history
    const wSnap = await getDocs(query(
      collection(db, "withdraw_requests"),
      where("uid", "==", uid)
    ));

    wSnap.forEach(d => {
      const data = d.data();
      allItems.push({
        type:   "withdraw",
        amount:  data.amount,
        method:  data.method || "UPI",
        upi:     data.upi || "",
        status:  data.status || "pending",
        ts:      data.createdAt?.toDate?.() || null
      });
    });

    // Convert history
    const cSnap = await getDocs(query(
      collection(db, "referral_conversions"),
      where("uid", "==", uid)
    ));

    cSnap.forEach(d => {
      const data = d.data();
      allItems.push({
        type:   "coins",
        amount:  data.amount,
        status: "approved",
        ts:     data.createdAt?.toDate?.() || null
      });
    });

    // Sort by newest first
    allItems.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    historyCount.textContent = `${allItems.length} record${allItems.length !== 1 ? "s" : ""}`;

    if (allItems.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <span>📭</span>
          No transactions yet
        </div>`;
      return;
    }

    historyList.innerHTML = "";

    allItems.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("history-item");

      const dateStr = item.ts
        ? item.ts.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Just now";

      let statusLabel, statusClass, typeLabel;

      if (item.type === "withdraw") {
        typeLabel  = `💸 Withdraw — ${item.method}`;
        statusClass = item.status;
        statusLabel =
          item.status === "approved" ? "✅ Approved" :
          item.status === "rejected" ? "❌ Rejected" :
          "⏳ Pending";
      } else {
        typeLabel   = "🪙 Converted to Coins";
        statusClass = "coins";
        statusLabel = "✅ Completed";
      }

      div.innerHTML = `
        <div class="history-left">
          <div class="history-type">${typeLabel}</div>
          <div class="history-meta">${dateStr}${item.upi ? " · " + item.upi : ""}</div>
        </div>
        <div class="history-right">
          <div class="history-amount">₹${item.amount}</div>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
      `;

      historyList.appendChild(div);
    });

  } catch (err) {
    console.error("History load error:", err);
    historyList.innerHTML = `
      <div class="empty-state">
        <span>❌</span>
        Error loading history
      </div>`;
  }
}
