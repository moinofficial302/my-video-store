// ================================
// APPLY COUPON (FINAL PRO SYSTEM)
// ================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.applyCoupon = async function () {

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

  const user = auth.currentUser;

  if (!user) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  try {

    const couponRef = doc(db, "coupons", code);
    const userRef = doc(db, "users", user.uid);
    const usageRef = doc(db, "coupon_usage", user.uid + "_" + code);

    await runTransaction(db, async (transaction) => {

      // 🔍 GET COUPON
      const couponSnap = await transaction.get(couponRef);

      if (!couponSnap.exists()) {
        throw new Error("🚫 Invalid coupon");
      }

      const coupon = couponSnap.data();

      // ✅ VALIDATE DATA
      const coins = Number(coupon.coins ?? coupon.value);
      const limit = Number(coupon.limit ?? 0);
      const used = Number(coupon.used ?? 0);

      if (isNaN(coins) || coins <= 0) {
        throw new Error("❌ Invalid coupon data");
      }

      if (isNaN(limit) || limit <= 0) {
        throw new Error("❌ Invalid coupon limit");
      }

      // 🚫 DISABLED
      if (coupon.active === false) {
        throw new Error("❌ Coupon disabled");
      }

      // 🚫 LIMIT FULL
      if (used >= limit) {
        throw new Error("❌ Coupon expired");
      }

      // 🚫 ALREADY USED
      const usageSnap = await transaction.get(usageRef);
      if (usageSnap.exists()) {
        throw new Error("🫣 Already used");
      }

      // 👤 USER CHECK
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("❌ User not found");
      }

      // 💰 ADD COINS
      transaction.update(userRef, {
        coins: (userSnap.data().coins || 0) + coins
      });

      // 📊 UPDATE COUPON USED
      transaction.update(couponRef, {
        used: used + 1
      });

      // 🔐 SAVE USAGE
      transaction.set(usageRef, {
        uid: user.uid,
        code: code,
        createdAt: serverTimestamp()
      });

    });

    // ✅ SUCCESS
    msg.innerText = "✅ Coupon applied successfully 🎉";
    msg.style.color = "green";

    document.getElementById("couponInput").value = "";

  } catch (err) {
    console.error("COUPON ERROR:", err);
    msg.innerText = err.message || "❌ Error occurred";
    msg.style.color = "red";
  }
};
