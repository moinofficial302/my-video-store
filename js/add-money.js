/* =====================================================
   💰 ADD MONEY — FIXED + UTR 2-TIME LIMIT
   ✅ Fix 1: DOMContentLoaded removed (module conflict fix)
   ✅ Fix 2: UTR same user 2 baar use kar sakta hai, 3rd baar nahi
   ✅ Fix 3: email null safe
   ✅ Fix 4: Specific error messages
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
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   🔔 TOAST
========================= */
function showToast(msg, type = "info", duration = 3200) {
  const toast = document.getElementById("toast");
  if (!toast) return;
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
  if (!btn) return;
  btn.disabled     = loading;
  if (spinner) spinner.classList.toggle("hidden", !loading);
  if (text)    text.textContent = loading ? "Submitting..." : "Submit Request 🚀";
}

/* =========================
   💰 LOAD COIN BALANCE
========================= */
async function loadCoinBalance(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;
    const coins = Number(snap.data().coins || 0);
    const el    = document.getElementById("coinBalance");
    if (el) el.textContent = coins;
    const bar   = document.getElementById("coinBar");
    if (bar) bar.style.width = Math.min((coins / 1000) * 100, 100) + "%";
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
  if (!historyList) return;

  historyList.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  try {
    const snap = await getDocs(query(
      collection(db, "add_money_requests"),
      where("uid", "==", uid)
    ));

    if (historyCount) {
      historyCount.textContent = `${snap.size} request${snap.size !== 1 ? "s" : ""}`;
    }

    if (snap.empty) {
      historyList.innerHTML = `
        <div class="empty-state">
          <span>📭</span>
          No requests yet. Add money to get started!
        </div>`;
      return;
    }

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
        ? item.createdAt.toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
          })
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
   🚀 SUBMIT REQUEST
========================= */
const submitBtn = document.getElementById("submitBtn");

if (submitBtn) {
  submitBtn.addEventListener("click", async () => {

    const user = auth.currentUser;
    if (!user) {
      showToast("Please login first 🔐", "error");
      window.location.href = "login.html";
      return;
    }

    const amountVal = document.getElementById("amountConfirm")?.value
                   || document.getElementById("amount")?.value;
    const utrVal    = document.getElementById("utr")?.value.trim();
    const appVal    = document.getElementById("paymentApp")?.value || "UPI";
    const amount    = Number(amountVal);

    // Validations
    if (!amountVal || isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount 💰", "warn"); return;
    }
    if (amount < 25) {
      showToast("Minimum amount is ₹25 ⚡", "warn"); return;
    }
    if (!utrVal || utrVal.length < 6) {
      showToast("Please enter a valid UTR/Transaction ID 🔢", "warn"); return;
    }

    setLoading(true);

    try {

      // =====================================================
      // ✅ UTR 2-TIME LIMIT CHECK
      // Same UTR — sirf is user ke liye — max 2 times allowed
      // 3rd time block hoga
      // =====================================================
      const utrSnap = await getDocs(query(
        collection(db, "add_money_requests"),
        where("uid", "==", user.uid),
        where("utr", "==", utrVal)
      ));

      const utrCount = utrSnap.size; // Kitni baar yeh UTR submit hui hai

      if (utrCount >= 2) {
        // 3rd baar — block karo
        showToast(
          "Yeh UTR ID 2 baar submit ho chuki hai. Ek UTR sirf 2 baar use ho sakti hai. ⚠️",
          "error",
          5000
        );
        setLoading(false);
        return;
      }

      // utrCount === 0 → pehli baar → allow
      // utrCount === 1 → doosri baar → allow (correction ke liye)
      // utrCount >= 2  → teesri baar → block (upar handle ho gaya)

      // =====================================================
      // Save request
      // =====================================================
      await addDoc(collection(db, "add_money_requests"), {
        uid:            user.uid,
        name:           user.displayName || "User",
        email:          user.email       || "",   // ✅ null safe
        amount:         amount,
        utr:            utrVal,
        paymentApp:     appVal,
        status:         "pending",
        // ✅ Agar 2nd submission hai — admin ko pata chale
        isCorrection:   utrCount === 1,
        submissionNo:   utrCount + 1,           // 1 ya 2
        createdAt:      serverTimestamp(),
        approvedAt:     null,
        rejectedReason: null
      });

      // Toast message — correction ke liye alag
      if (utrCount === 1) {
        showToast(
          `₹${amount} correction request submitted! ✅ Admin purani reject karke yeh approve karega.`,
          "success",
          5000
        );
      } else {
        showToast(
          `₹${amount} request submitted! ⏳ Wait 2–15 min`,
          "success",
          4000
        );
      }

      // Reset form
      const amountEl        = document.getElementById("amount");
      const amountConfirmEl = document.getElementById("amountConfirm");
      const utrEl           = document.getElementById("utr");
      const amountPreview   = document.getElementById("amountPreview");

      if (amountEl)        amountEl.value        = "";
      if (amountConfirmEl) amountConfirmEl.value  = "";
      if (utrEl)           utrEl.value            = "";
      if (amountPreview)   amountPreview.classList.add("hidden");
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));

      await loadHistory(user.uid);
      await loadCoinBalance(user.uid);

    } catch (err) {
      console.error("Submit error:", err.code, err.message);

      if (err.code === "permission-denied") {
        showToast("Permission error. Please logout and login again 🔐", "error");
      } else if (err.code === "unavailable") {
        showToast("No internet connection. Check network and retry 📡", "error");
      } else {
        showToast("Something went wrong. Please try again ❌", "error");
      }
    } finally {
      setLoading(false);
    }
  });
}

/* =========================
   🔒 AUTH CHECK
========================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadCoinBalance(user.uid);
  loadHistory(user.uid);
});


