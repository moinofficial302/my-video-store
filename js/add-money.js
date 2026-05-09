/* =====================================================
   💰 ADD MONEY SYSTEM — UPGRADED (ALL BUGS FIXED)
   ✔ Toast replaces all alert()
   ✔ Auth check on page load
   ✔ Duplicate UTR check
   ✔ Amount validation
   ✔ Loading spinner
   ✔ History section
   ✔ Coin balance display
   ✔ Coupon system removed (separate page hai)
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   🔔 TOAST — alert() replace
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
   ⚙️ LOADING STATE
========================= */
function setLoading(loading) {
  const btn     = document.getElementById("submitBtn");
  const spinner = document.getElementById("submitBtnSpinner");
  const text    = document.getElementById("submitBtnText");
  btn.disabled         = loading;
  spinner.classList.toggle("hidden", !loading);
  text.textContent     = loading ? "Submitting..." : "Submit Request 🚀";
}

/* =========================
   💰 LOAD COIN BALANCE
========================= */
async function loadCoinBalance(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;
    const coins = Number(snap.data().coins || 0);
    document.getElementById("coinBalance").textContent = coins;
    const pct = Math.min((coins / 1000) * 100, 100);
    document.getElementById("coinBar").style.width = pct + "%";
  } catch (err) {
    console.error("Balance load error:", err);
  }
}

/* =========================
   📋 LOAD HISTORY
========================= */
async function loadHistory(uid) {
  const historyList  = document.getElementById("historyList");
  const historyCount = document.getElementById("historyCount");

  historyList.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  try {
    const snap = await getDocs(query(
      collection(db, "add_money_requests"),
      where("uid", "==", uid)
    ));

    historyCount.textContent = `${snap.size} request${snap.size !== 1 ? "s" : ""}`;

    if (snap.empty) {
      historyList.innerHTML = `
        <div class="empty-state">
          <span>📭</span>
          No requests yet. Add money to get started!
        </div>`;
      return;
    }

    // Sort newest first
    const items = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        amount:     data.amount,
        paymentApp: data.paymentApp || "UPI",
        utr:        data.utr || "—",
        status:     data.status || "pending",
        createdAt:  data.createdAt?.toDate?.() || null
      });
    });
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    historyList.innerHTML = "";
    items.forEach(item => {
      const dateStr = item.createdAt
        ? item.createdAt.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
        : "Just now";

      const statusLabel =
        item.status === "approved" ? "✅ Approved" :
        item.status === "rejected" ? "❌ Rejected" :
        "⏳ Pending";

      const div = document.createElement("div");
      div.classList.add("history-item");
      div.innerHTML = `
        <div class="history-left">
          <div class="history-app">💳 ${item.paymentApp}</div>
          <div class="history-utr">UTR: ${item.utr} · ${dateStr}</div>
        </div>
        <div class="history-right">
          <div class="history-amount">₹${item.amount}</div>
          <span class="status-badge ${item.status}">${statusLabel}</span>
        </div>
      `;
      historyList.appendChild(div);
    });

  } catch (err) {
    console.error("History error:", err);
    historyList.innerHTML = `
      <div class="empty-state">
        <span>❌</span>
        Error loading history
      </div>`;
  }
}

/* =========================
   🔒 AUTH CHECK — BUG FIX
   Page load pe check hota hai
========================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadCoinBalance(user.uid);
  loadHistory(user.uid);
});

/* =========================
   🚀 SUBMIT REQUEST
   BUG FIX: duplicate UTR check
   BUG FIX: amount validation
   BUG FIX: alert() → toast
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async () => {

    const user = auth.currentUser;
    if (!user) {
      showToast("Please login first 🔐", "error");
      window.location.href = "login.html";
      return;
    }

    const amountVal = document.getElementById("amount").value;
    const utrVal    = document.getElementById("utr").value.trim();
    const appVal    = document.getElementById("paymentApp").value;
    const amount    = Number(amountVal);

    // Validations
    if (!amountVal || isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount 💰", "warn"); return;
    }
    if (amount < 20) {
      showToast("Minimum amount is ₹20 ⚡", "warn"); return;
    }
    if (!utrVal || utrVal.length < 6) {
      showToast("Please enter a valid UTR/Transaction ID 🔢", "warn"); return;
    }

    setLoading(true);

    try {

      // 🔒 BUG FIX: Duplicate UTR check
      const dupSnap = await getDocs(query(
        collection(db, "add_money_requests"),
        where("utr", "==", utrVal)
      ));

      if (!dupSnap.empty) {
        showToast("This UTR ID is already submitted! ⚠️", "error");
        setLoading(false);
        return;
      }

      // ✅ Save request
      await addDoc(collection(db, "add_money_requests"), {
        uid:        user.uid,
        name:       user.displayName || "User",
        email:      user.email || "",
        amount:     amount,
        utr:        utrVal,
        paymentApp: appVal,
        status:     "pending",
        createdAt:  serverTimestamp(),
        approvedAt: null,
        rejectedReason: null
      });

      showToast(`Request of ₹${amount} submitted! ⏳ Wait 2–15 min`, "success", 4000);

      // Reset form
      document.getElementById("amount").value = "";
      document.getElementById("utr").value    = "";
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));

      // Reload history
      await loadHistory(user.uid);

    } catch (err) {
      console.error("Submit error:", err);
      showToast("Something went wrong. Please try again ❌", "error");
    } finally {
      setLoading(false);
    }
  });

});
