// ================================
// APPLY COUPON (FIXED & SAFE)
// ================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.applyCoupon = function () {

  const code = document
    .getElementById("couponInput")
    .value
    .trim()
    .toUpperCase();

  const msg = document.getElementById("couponMsg");

  if (!code) {
    msg.innerText = "❌ Please enter a coupon code";
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    try {
      const couponRef = doc(db, "coupons", code);
      const couponSnap = await getDoc(couponRef);

      if (!couponSnap.exists()) {
        msg.innerText = "❌ Invalid coupon code";
        return;
      }

      const coupon = couponSnap.data();

      // SAFETY FALLBACKS
      const used = coupon.used || 0;
      const limit = coupon.limit || 0;
      const coins = coupon.coins || 0;

      if (!coupon.active) {
        msg.innerText = "❌ Coupon expired";
        return;
      }

      if (used >= limit) {
        msg.innerText = "❌ Coupon limit reached";
        return;
      }

      // ADD COINS TO USER
      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(coins)
      });

      // UPDATE COUPON USED COUNT
      await updateDoc(couponRef, {
        used: increment(1)
      });

      msg.innerText = `✅ Coupon applied! ${coins} coins added 🎉`;
      msg.style.color = "green";

      document.getElementById("couponInput").value = "";

    } catch (err) {
      console.error(err);
      msg.innerText = "❌ Something went wrong";
    }
  });
};
