// ================================
// APPLY COUPON (FULL SECURE)
// ================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc
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
    msg.innerText = "❌ Enter coupon code";
    return;
  }

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      alert("Login first");
      window.location.href = "login.html";
      return;
    }

    try {

      // 🔍 GET COUPON
      const couponRef = doc(db, "coupons", code);
      const couponSnap = await getDoc(couponRef);

      if (!couponSnap.exists()) {
        msg.innerText = "❌ Invalid coupon";
        return;
      }

      const coupon = couponSnap.data();

      const used = coupon.used || 0;
      const limit = coupon.limit || 0;
      const coins = coupon.coins || 0;

      if (!coupon.active) {
        msg.innerText = "❌ Coupon expired";
        return;
      }

      if (used >= limit) {
        msg.innerText = "❌ Limit reached";
        return;
      }

      // 🚫 CHECK ALREADY USED
      const usageRef = doc(db, "coupon_usage", user.uid + "_" + code);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        msg.innerText = "❌ Already used";
        return;
      }

      // 💰 ADD COINS
      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(coins)
      });

      // 📊 UPDATE COUPON COUNT
      await updateDoc(couponRef, {
        used: increment(1)
      });

      // 🔐 SAVE USAGE (MAIN SECURITY)
      await setDoc(usageRef, {
        uid: user.uid,
        code: code,
        time: new Date()
      });

      msg.innerText = `✅ ${coins} coins added 🎉`;
      msg.style.color = "green";

      document.getElementById("couponInput").value = "";

    } catch (err) {
      console.error(err);
      msg.innerText = "❌ Error occurred";
    }

  });
};
