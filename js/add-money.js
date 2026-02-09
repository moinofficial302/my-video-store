/* =====================================================
   💛 AKANS ADD MONEY SYSTEM — FINAL SAFE VERSION
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   WAIT FOR DOM (🔥 important)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {


/* ===============================
   ELEMENTS
=============================== */

const submitBtn = document.getElementById("submitBtn");
const amountInput = document.getElementById("amount");
const utrInput = document.getElementById("utr");
const paymentInput = document.getElementById("paymentApp");

const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponInput = document.getElementById("couponCode");
const couponMsg = document.getElementById("couponMsg");


/* =====================================================
   🟢 ADD MONEY SUBMIT
===================================================== */

if (submitBtn) {

  submitBtn.addEventListener("click", async () => {

    const amount = amountInput?.value;
    const utr = utrInput?.value;
    const paymentApp = paymentInput?.value || "Unknown";

    const user = auth.currentUser;

    if (!user) return alert("Login required");

    if (!amount || Number(amount) < 20)
      return alert("Minimum ₹20");

    if (!utr || utr.trim().length < 6)
      return alert("Enter valid UTR");

    try {

      await addDoc(collection(db, "add_money_requests"), {

        uid: user.uid,            // 🔥 rule required
        name: user.displayName || "User",
        email: user.email,

        amount: Number(amount),
        utr: utr.trim(),
        paymentApp,

        status: "pending",        // 🔥 EXACT lowercase
        createdAt: serverTimestamp(),
        approvedAt: null,
        rejectedReason: null
      });

      alert("Request submitted ✅");
      window.location.href = "account.html";

    } catch (e) {
      alert(e.message);
    }

  });

}



/* =====================================================
   🎟️ COUPON SYSTEM
===================================================== */

if (applyCouponBtn) {

  applyCouponBtn.addEventListener("click", async () => {

    const code = couponInput.value.trim().toUpperCase();
    if (!code) return showMsg("Enter coupon", "red");

    const user = auth.currentUser;
    if (!user) return showMsg("Login required", "red");

    try {

      const q = query(
        collection(db, "coupons"),
        where("code", "==", code),
        where("active", "==", true)
      );

      const snap = await getDocs(q);
      if (snap.empty)
        return showMsg("Invalid coupon", "red");

      const couponDoc = snap.docs[0].id;
      const coupon = snap.docs[0].data();

      if (coupon.used >= coupon.limit)
        return showMsg("Limit reached", "red");

      const usedQ = query(
        collection(db, "coupon_usage"),
        where("couponCode", "==", code),
        where("uid", "==", user.uid)
      );

      const usedSnap = await getDocs(usedQ);
      if (!usedSnap.empty)
        return showMsg("Already used", "red");

      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(coupon.value)
      });

      await updateDoc(doc(db, "coupons", couponDoc), {
        used: increment(1)
      });

      await addDoc(collection(db, "coupon_usage"), {
        couponCode: code,
        uid: user.uid,
        usedAt: serverTimestamp()
      });

      showMsg(`🎉 +${coupon.value} coins added`, "green");

    } catch (err) {
      showMsg("Error occurred", "red");
    }

  });

}


function showMsg(msg, color) {
  if (!couponMsg) return;
  couponMsg.textContent = msg;
  couponMsg.style.color = color;
}

});
