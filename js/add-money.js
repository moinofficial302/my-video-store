import { auth, db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   SAFE ELEMENT GETTERS
================================ */
const submitBtn = document.getElementById("submitBtn");
const amountInput = document.getElementById("amount");
const utrInput = document.getElementById("utr");
const paymentInput = document.getElementById("paymentApp");

/* ===============================
   SUBMIT REQUEST
================================ */
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const amount = amountInput?.value;
    const utr = utrInput?.value;
    const paymentApp = paymentInput?.value || "Unknown";

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!amount || Number(amount) < 20) {
      alert("Minimum amount ₹20");
      return;
    }

    if (!utr || utr.trim().length < 6) {
      alert("Enter valid Transaction / UTR ID");
      return;
    }

    try {
      await addDoc(collection(db, "add_money_requests"), {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,

        amount: Number(amount),
        utr: utr.trim(),
        paymentApp: paymentApp,

        status: "pending",
        createdAt: serverTimestamp(),
        approvedAt: null,
        rejectedReason: null
      });

      alert("Request submitted successfully");
      window.location.href = "account.html";

    } catch (error) {
      alert(error.message);
    }
  });
}

/* ===============================
   PAYMENT APP BOTTOM SHEET (SAFE)
   → Only runs if HTML exists
================================ */
const openPayment = document.getElementById("openPaymentSheet");
const sheet = document.getElementById("paymentSheet");
const selectedText = document.getElementById("selectedApp");
const items = document.querySelectorAll(".sheet-item");

if (openPayment && sheet && items.length > 0) {

  openPayment.addEventListener("click", () => {
    sheet.classList.add("active");
    document.body.classList.add("sheet-open");
  });

  items.forEach(item => {
    item.addEventListener("click", () => {
      const app = item.dataset.app;

      if (selectedText) selectedText.innerText = app;
      if (paymentInput) paymentInput.value = app;

      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      sheet.classList.remove("active");
      document.body.classList.remove("sheet-open");
    });
  });

  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) {
      sheet.classList.remove("active");
      document.body.classList.remove("sheet-open");
    }
  });

}


// =======================================
// APPLY COUPON (USER SIDE)
// =======================================

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase-init.js";

// DOM
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponInput = document.getElementById("couponCode");
const couponMsg = document.getElementById("couponMsg");

// =======================================
applyCouponBtn.addEventListener("click", async () => {

  const code = couponInput.value.trim().toUpperCase();
  if (!code) return showMsg("Enter coupon code", "red");

  const user = auth.currentUser;
  if (!user) return showMsg("Login required", "red");

  try {
    // 1️⃣ Check coupon exists
    const q = query(
      collection(db, "coupons"),
      where("code", "==", code),
      where("active", "==", true)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      return showMsg("Invalid or expired coupon", "red");
    }

    let couponDoc, coupon;
    snap.forEach(d => {
      couponDoc = d.id;
      coupon = d.data();
    });

    // 2️⃣ Limit check
    if (coupon.used >= coupon.limit) {
      return showMsg("Coupon limit reached", "red");
    }

    // 3️⃣ Check already used by this user
    const usedQ = query(
      collection(db, "coupon_usage"),
      where("couponCode", "==", code),
      where("uid", "==", user.uid)
    );

    const usedSnap = await getDocs(usedQ);
    if (!usedSnap.empty) {
      return showMsg("Coupon already used", "red");
    }

    // 4️⃣ Add coins to user
    await updateDoc(doc(db, "users", user.uid), {
      coins: increment(coupon.value)
    });

    // 5️⃣ Update coupon usage count
    await updateDoc(doc(db, "coupons", couponDoc), {
      used: increment(1)
    });

    // 6️⃣ Save usage record
    await addDoc(collection(db, "coupon_usage"), {
      couponCode: code,
      uid: user.uid,
      usedAt: serverTimestamp()
    });

    showMsg(`🎉 Coupon Applied! +${coupon.value} coins`, "green");

  } catch (err) {
    console.error(err);
    showMsg("Something went wrong", "red");
  }
});

// =======================================
// MESSAGE HELPER
// =======================================
function showMsg(msg, color) {
  couponMsg.textContent = msg;
  couponMsg.style.color = color;
}

