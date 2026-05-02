// ================================
// COUPON PAGE — UPGRADED (ALL BUGS FIXED)
// ================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
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
   💬 COUPON MESSAGE (inline)
========================= */
function showMsg(msg, type = "error") {
  const el = document.getElementById("couponMsg");
  el.textContent = msg;
  el.className = `coupon-msg ${type === "success" ? "success-msg" : "error-msg"}`;
  el.classList.remove("hidden");
}

function hideMsg() {
  const el = document.getElementById("couponMsg");
  el.classList.add("hidden");
}

/* =========================
   ⚙️ LOADING STATE
========================= */
function setLoading(loading) {
  const btn     = document.getElementById("applyBtn");
  const spinner = document.getElementById("applyBtnSpinner");
  const text    = document.getElementById("applyBtnText");
  btn.disabled            = loading;
  spinner.classList.toggle("hidden", !loading);
  text.textContent        = loading ? "Applying..." : "Apply Coupon 🚀";
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
    // Progress bar — max 1000 coins assumed
    const pct = Math.min((coins / 1000) * 100, 100);
    document.getElementById("coinBar").style.width = pct + "%";
  } catch (err) {
    console.error("Balance load error:", err);
  }
}

/* =========================
   📋 LOAD COUPON HISTORY
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
      collection(db, "coupon_usage"),
      where("uid", "==", uid)
    ));

    historyCount.textContent = `${snap.size} record${snap.size !== 1 ? "s" : ""}`;

    if (snap.empty) {
      historyList.innerHTML = `
        <div class="empty-state">
          <span>🎟️</span>
          No coupons used yet
        </div>`;
      return;
    }

    // Collect + sort newest first
    const items = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        code:      data.code || "—",
        coins:     data.coins || 0,
        createdAt: data.createdAt?.toDate?.() || null
      });
    });
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    historyList.innerHTML = "";
    items.forEach(item => {
      const dateStr = item.createdAt
        ? item.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Just now";

      const div = document.createElement("div");
      div.classList.add("history-item");
      div.innerHTML = `
        <div class="history-left">
          <div class="history-code">🎟️ ${item.code}</div>
          <div class="history-date">${dateStr}</div>
        </div>
        <div class="history-right">
          <div class="history-coins">+${item.coins} 🪙</div>
          <span class="used-badge">✅ Applied</span>
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
   🔒 AUTH CHECK
========================= */
auth.onAuthStateChanged(user => {
  if (!user) {
    // BUG FIX: alert() replaced with redirect directly
    window.location.href = "login.html";
    return;
  }
  loadCoinBalance(user.uid);
  loadHistory(user.uid);
});

/* =========================
   🎟️ APPLY COUPON
   BUG FIX: no window.applyCoupon global,
   proper event listener, expiry check added
========================= */
document.getElementById("applyBtn")
  .addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) {
    showToast("Please login first 🔐", "error");
    window.location.href = "login.html";
    return;
  }

  const code = document.getElementById("couponInput").value.trim().toUpperCase();

  if (!code) {
    showMsg("Please enter a coupon code 🎟️", "error");
    return;
  }

  hideMsg();
  setLoading(true);

  try {
    const couponRef = doc(db, "coupons", code);
    const userRef   = doc(db, "users", user.uid);
    const usageRef  = doc(db, "coupon_usage", user.uid + "_" + code);

    let coinsEarned = 0;

    await runTransaction(db, async (transaction) => {

      // 🔍 GET COUPON
      const couponSnap = await transaction.get(couponRef);
      if (!couponSnap.exists()) throw new Error("🚫 Invalid coupon code");

      const coupon = couponSnap.data();
      const coins  = Number(coupon.coins ?? coupon.value ?? 0);
      const limit  = Number(coupon.limit ?? 0);
      const used   = Number(coupon.used  ?? 0);

      // ✅ VALIDATE
      if (isNaN(coins) || coins <= 0) throw new Error("❌ Coupon has no coins value");
      if (isNaN(limit) || limit <= 0) throw new Error("❌ Coupon limit not set");

      // 🚫 DISABLED
      if (coupon.active === false) throw new Error("❌ This coupon is disabled");

      // 🚫 EXPIRED BY DATE (NEW: expiry date check)
      if (coupon.expiresAt) {
        const expiry = coupon.expiresAt.toDate?.() || new Date(coupon.expiresAt);
        if (new Date() > expiry) throw new Error("⏰ Coupon has expired");
      }

      // 🚫 LIMIT REACHED
      if (used >= limit) throw new Error("❌ Coupon limit reached");

      // 🚫 ALREADY USED
      const usageSnap = await transaction.get(usageRef);
      if (usageSnap.exists()) throw new Error("🫣 You already used this coupon");

      // 👤 USER CHECK
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("❌ User account not found");

      coinsEarned = coins;

      // 💰 ADD COINS
      transaction.update(userRef, {
        coins: (userSnap.data().coins || 0) + coins
      });

      // 📊 INCREMENT USED COUNT
      transaction.update(couponRef, { used: used + 1 });

      // 🔐 SAVE USAGE — now also stores coins for history display
      transaction.set(usageRef, {
        uid:       user.uid,
        code:      code,
        coins:     coins,
        createdAt: serverTimestamp()
      });
    });

    // ✅ SUCCESS
    showMsg(`✅ Coupon applied! +${coinsEarned} coins added 🎉`, "success");
    showToast(`+${coinsEarned} coins credited! 🪙`, "success");
    document.getElementById("couponInput").value = "";
    document.getElementById("clearBtn").style.display = "none";
    document.getElementById("charHint").textContent = "Max 20 characters";

    await loadCoinBalance(user.uid);
    await loadHistory(user.uid);

  } catch (err) {
    console.error("COUPON ERROR:", err);
    const errMsg = err.message || "❌ Something went wrong";
    showMsg(errMsg, "error");
    showToast(errMsg, "error");
  } finally {
    setLoading(false);
  }
});
